import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { resolveScope } from "../accounts/account-scope";
import { useAccountSelection } from "../accounts/account-scope.store";
import { ALL_ACCOUNTS } from "../accounts/accounts.config";
import {
  AUTH_STATUS,
  REMOTE_DATA,
  REMOTE_STATUS,
  SNAPSHOT_CONNECTION,
  STORAGE_API,
} from "./storage.config";
import type {
  ApiError,
  AppSnapshot,
  RemoteData,
  SnapshotConnection,
  StorageSnapshot,
} from "./storage.types";

const NO_ACCOUNTS: AppSnapshot = {
  accounts: [],
  login: { status: AUTH_STATUS.signedOut },
  revision: 0,
};

const EMPTY_SNAPSHOT: StorageSnapshot = {
  auth: { status: AUTH_STATUS.signedOut },
  units: [],
  loadingUnits: false,
  transfer: { status: "idle" },
  syncError: null,
  revision: 0,
};

let snapshot: AppSnapshot = NO_ACCOUNTS;
/** False until the server's first push; before that "signed out" is a guess, not a fact. */
let received = false;
let connection: SnapshotConnection = SNAPSHOT_CONNECTION.connecting;
let source: EventSource | undefined;
const listeners = new Set<() => void>();

function notify(): void {
  for (const listener of listeners) listener();
}

function publish(next: AppSnapshot): void {
  snapshot = next;
  notify();
}

function setConnection(next: SnapshotConnection): void {
  if (connection === next) return;
  connection = next;
  notify();
}

function parseSnapshot(raw: string): AppSnapshot | undefined {
  try {
    const value: unknown = JSON.parse(raw);
    return typeof value === "object" && value !== null && "accounts" in value && "login" in value
      ? (value as AppSnapshot)
      : undefined;
  } catch {
    return undefined;
  }
}

function openSource(): void {
  const opened = new EventSource(STORAGE_API.events);
  source = opened;
  opened.onmessage = (event: MessageEvent<string>) => {
    const next = parseSnapshot(event.data);
    if (!next) {
      // A server from another version speaks a shape this page can't read; say so instead of waiting forever.
      if (!received) setConnection(SNAPSHOT_CONNECTION.incompatible);
      return;
    }
    received = true;
    if (next.accounts.length === 0) remoteCache.clear();
    connection = SNAPSHOT_CONNECTION.open;
    publish(next);
  };
  opened.onerror = () => {
    // EventSource retries dropped streams itself, but gives up for good on a bad response.
    // Once data has arrived the last snapshot stays usable, so only the first load reports it.
    if (!received) setConnection(SNAPSHOT_CONNECTION.disconnected);
  };
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (!source) openSource();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      source?.close();
      source = undefined;
    }
  };
}

/** Whether the server has told us the real auth state yet. */
export function useSnapshotReceived(): boolean {
  return useSyncExternalStore(subscribe, () => received);
}

/** How the live connection to the server is doing, for the first-load screen. */
export function useSnapshotConnection(): SnapshotConnection {
  return useSyncExternalStore(subscribe, () => connection);
}

/** Drops the current event stream and opens a new one (a closed EventSource never reconnects by itself). */
export function retrySnapshotConnection(): void {
  source?.close();
  setConnection(SNAPSHOT_CONNECTION.connecting);
  if (listeners.size > 0) openSource();
  else source = undefined;
}

/** Every account and the add-account login in progress. */
export function useAppSnapshot(): AppSnapshot {
  return useSyncExternalStore(subscribe, () => snapshot);
}

/**
 * The connection state of the account(s) being viewed. For one account it is that account's
 * snapshot; for "all" it is a combined one (summed revision, units omitted since unit ids only
 * mean something within an account).
 */
export function useStorageSnapshot(): StorageSnapshot {
  const app = useAppSnapshot();
  const selected = useAccountSelection((state) => state.selected);
  return useMemo(() => {
    const scope = resolveScope(
      selected,
      app.accounts.map((account) => account.steamId),
    );
    if (scope === undefined) return EMPTY_SNAPSHOT;
    if (scope !== ALL_ACCOUNTS)
      return app.accounts.find((account) => account.steamId === scope)?.snapshot ?? EMPTY_SNAPSHOT;
    const snapshots = app.accounts.map((account) => account.snapshot);
    return {
      auth: { status: AUTH_STATUS.ready, displayName: null },
      units: [],
      loadingUnits: snapshots.some((s) => s.loadingUnits),
      transfer: { status: "idle" },
      syncError: snapshots.find((s) => s.syncError)?.syncError ?? null,
      revision: snapshots.reduce((sum, s) => sum + s.revision, 0),
    } satisfies StorageSnapshot;
  }, [app, selected]);
}

async function readError(response: Response): Promise<string> {
  const body = (await response.json().catch(() => undefined)) as ApiError | undefined;
  return body?.error ?? `Request failed (${response.status})`;
}

export async function callStorageApi(path: string): Promise<void> {
  const response = await fetch(path, { method: "POST" });
  if (!response.ok) throw new Error(await readError(response));
}

export async function postJson(path: string, body: unknown): Promise<void> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(await readError(response));
}

export async function postForJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(await readError(response));
  return (await response.json()) as T;
}

/** A failure worth retrying (server-side), as opposed to a request the server rejected. */
class TransientError extends Error {}

export type { RemoteData } from "./storage.types";

/** What a failed load keeps between renders; `retry` is attached when it is returned. */
type StoredRemoteData<T> =
  | Exclude<RemoteData<T>, { readonly status: typeof REMOTE_STATUS.error }>
  | { readonly status: typeof REMOTE_STATUS.error; readonly message: string };

const LOADING = { status: REMOTE_STATUS.loading } as const;

/** The account a scoped API path asks about, or null for unscoped paths. */
function scopeOf(path: string | undefined): string | null {
  if (!path) return null;
  const query = path.split("?")[1];
  return query === undefined ? null : new URLSearchParams(query).get(REMOTE_DATA.scopeParam);
}

/** Last good response per path, so revisiting a page shows data instantly while it refetches. */
const remoteCache = new Map<string, unknown>();

function isCacheable(path: string): boolean {
  return !REMOTE_DATA.uncachedPathPrefixes.some((prefix) => path.startsWith(prefix));
}

function readCache<T>(path: string | undefined): StoredRemoteData<T> | undefined {
  if (!path || !remoteCache.has(path)) return undefined;
  return { status: REMOTE_STATUS.ready, data: remoteCache.get(path) as T };
}

function writeCache(path: string, data: unknown): void {
  if (!isCacheable(path)) return;
  remoteCache.delete(path);
  remoteCache.set(path, data);
  while (remoteCache.size > REMOTE_DATA.cacheMaxEntries) {
    const oldest = remoteCache.keys().next();
    if (oldest.done) break;
    remoteCache.delete(oldest.value);
  }
}

function isPageVisible(): boolean {
  return document.visibilityState === REMOTE_DATA.visibleState;
}

function subscribeVisibility(listener: () => void): () => void {
  document.addEventListener("visibilitychange", listener);
  return () => document.removeEventListener("visibilitychange", listener);
}

/** Whether this tab is in the foreground. Background polling should pause while false. */
export function usePageVisible(): boolean {
  return useSyncExternalStore(subscribeVisibility, isPageVisible, () => true);
}

/**
 * GETs `path`. A changed `path` (user action) and the first load fetch at once;
 * a changed `revision` alone refetches debounced, and is deferred while the tab is
 * hidden (one catch-up fetch runs when it returns). Cached data for `path` shows
 * immediately and is revalidated; previous data for the same account stays on screen
 * during a refetch so the UI never flashes empty, but another account's data never does.
 * A failed load carries `retry`, which fetches again at once.
 */
export function useRemoteData<T>(path: string | undefined, revision: number): RemoteData<T> {
  const [loaded, setLoaded] = useState<{ path: string | undefined; value: StoredRemoteData<T> }>(
    () => ({ path, value: readCache<T>(path) ?? LOADING }),
  );
  const visible = usePageVisible();
  const lastPath = useRef<string | undefined>(undefined);
  const lastVisible = useRef(visible);
  const fetchedRevision = useRef<number | undefined>(undefined);
  const failures = useRef(0);
  const manualRetry = useRef(false);
  // Bumped by the retry timer after a transient failure (or by `retry`), to rerun the fetch effect.
  const [retryTick, setRetryTick] = useState(0);

  const retry = useCallback(() => {
    failures.current = 0;
    manualRetry.current = true;
    setLoaded((current) => ({ path: current.path, value: LOADING }));
    setRetryTick((tick) => tick + 1);
  }, []);

  useEffect(() => {
    if (!path) {
      lastPath.current = undefined;
      return;
    }
    const pathChanged = lastPath.current !== path;
    const becameVisible = visible && !lastVisible.current;
    const immediate = manualRetry.current;
    manualRetry.current = false;
    lastPath.current = path;
    lastVisible.current = visible;
    if (
      !pathChanged &&
      !immediate &&
      (!visible || (becameVisible && fetchedRevision.current === revision))
    )
      return;
    fetchedRevision.current = revision;
    if (pathChanged) failures.current = 0;

    const controller = new AbortController();
    const delay = pathChanged || becameVisible || immediate ? 0 : REMOTE_DATA.revisionDebounceMs;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(path, { signal: controller.signal });
        if (!response.ok) {
          const message = await readError(response);
          throw response.status >= REMOTE_DATA.serverErrorStatus
            ? new TransientError(message)
            : new Error(message);
        }
        const data = (await response.json()) as T;
        writeCache(path, data);
        failures.current = 0;
        setLoaded({ path, value: { status: REMOTE_STATUS.ready, data } });
      } catch (error) {
        if (controller.signal.aborted) return;
        // Forget this revision was fetched, so returning to a hidden tab retries it.
        fetchedRevision.current = undefined;
        // A dropped connection or a restarting server is transient: keep what is on screen
        // and try again, instead of swapping a good table for an error until the next push.
        const transient = error instanceof TransientError || error instanceof TypeError;
        if (transient && failures.current < REMOTE_DATA.retryDelaysMs.length) {
          const wait = REMOTE_DATA.retryDelaysMs[failures.current] ?? REMOTE_DATA.retryDelaysMs[0];
          failures.current += 1;
          retryTimer = setTimeout(() => setRetryTick((tick) => tick + 1), wait);
        }
        // Keep this path's last good response, or its cached copy when revisiting a page.
        setLoaded((current) =>
          current.path === path && current.value.status === REMOTE_STATUS.ready
            ? current
            : {
                path,
                value: readCache<T>(path) ?? {
                  status: REMOTE_STATUS.error,
                  message: error instanceof Error ? error.message : String(error),
                },
              },
        );
      }
    }, delay);
    return () => {
      clearTimeout(timer);
      clearTimeout(retryTimer);
      controller.abort();
    };
  }, [path, revision, visible, retryTick]);

  if (!path) return LOADING;
  const value =
    loaded.path === path
      ? loaded.value
      : // Another path's data lingers while this one loads (e.g. a new filter), unless this one
        // is cached; data for another account is never shown under this one.
        (readCache<T>(path) ?? (scopeOf(loaded.path) === scopeOf(path) ? loaded.value : LOADING));
  return value.status === REMOTE_STATUS.error ? { ...value, retry } : value;
}
