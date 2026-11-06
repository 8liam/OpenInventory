import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AUTH_STATUS, REMOTE_DATA, STORAGE_API } from "./storage.config";
import type { ApiError, StorageSnapshot } from "./storage.types";

const SIGNED_OUT: StorageSnapshot = {
  auth: { status: AUTH_STATUS.signedOut },
  units: [],
  loadingUnits: false,
  transfer: { status: "idle" },
  syncError: null,
  revision: 0,
};

let snapshot: StorageSnapshot = SIGNED_OUT;
/** False until the server's first push; before that "signed out" is a guess, not a fact. */
let received = false;
let source: EventSource | undefined;
const listeners = new Set<() => void>();

function publish(next: StorageSnapshot): void {
  snapshot = next;
  for (const listener of listeners) listener();
}

function parseSnapshot(raw: string): StorageSnapshot | undefined {
  try {
    const value: unknown = JSON.parse(raw);
    return typeof value === "object" && value !== null && "auth" in value && "units" in value
      ? (value as StorageSnapshot)
      : undefined;
  } catch {
    return undefined;
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (!source) {
    source = new EventSource(STORAGE_API.events);
    source.onmessage = (event: MessageEvent<string>) => {
      const next = parseSnapshot(event.data);
      if (!next) return;
      received = true;
      if (next.auth.status === AUTH_STATUS.signedOut) remoteCache.clear();
      publish(next);
    };
  }
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

export function useStorageSnapshot(): StorageSnapshot {
  return useSyncExternalStore(subscribe, () => snapshot);
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

export type RemoteData<T> =
  | { readonly status: "loading" }
  | { readonly status: "error"; readonly message: string }
  | { readonly status: "ready"; readonly data: T };

/** Last good response per path, so revisiting a page shows data instantly while it refetches. */
const remoteCache = new Map<string, unknown>();

function isCacheable(path: string): boolean {
  return !REMOTE_DATA.uncachedPathPrefixes.some((prefix) => path.startsWith(prefix));
}

function readCache<T>(path: string | undefined): RemoteData<T> | undefined {
  if (!path || !remoteCache.has(path)) return undefined;
  return { status: "ready", data: remoteCache.get(path) as T };
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
 * immediately and is revalidated; previous data stays on screen during a refetch
 * so the UI never flashes empty.
 */
export function useRemoteData<T>(path: string | undefined, revision: number): RemoteData<T> {
  const [loaded, setLoaded] = useState<{ path: string | undefined; value: RemoteData<T> }>(() => ({
    path,
    value: readCache<T>(path) ?? { status: "loading" },
  }));
  const visible = usePageVisible();
  const lastPath = useRef<string | undefined>(undefined);
  const lastVisible = useRef(visible);
  const fetchedRevision = useRef<number | undefined>(undefined);
  const failures = useRef(0);
  // Bumped by the retry timer after a transient failure, to rerun the fetch effect.
  const [retryTick, setRetryTick] = useState(0);

  useEffect(() => {
    if (!path) {
      lastPath.current = undefined;
      return;
    }
    const pathChanged = lastPath.current !== path;
    const becameVisible = visible && !lastVisible.current;
    lastPath.current = path;
    lastVisible.current = visible;
    if (!pathChanged && (!visible || (becameVisible && fetchedRevision.current === revision)))
      return;
    fetchedRevision.current = revision;
    if (pathChanged) failures.current = 0;

    const controller = new AbortController();
    const delay = pathChanged || becameVisible ? 0 : REMOTE_DATA.revisionDebounceMs;
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
        setLoaded({ path, value: { status: "ready", data } });
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
          current.path === path && current.value.status === "ready"
            ? current
            : {
                path,
                value: readCache<T>(path) ?? {
                  status: "error",
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

  if (!path) return { status: "loading" };
  // Another path's data lingers while this one loads, unless this one is cached.
  return loaded.path === path ? loaded.value : (readCache<T>(path) ?? loaded.value);
}
