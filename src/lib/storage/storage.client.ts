import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AUTH_STATUS, STORAGE_API } from "./storage.config";
import type { ApiError, StorageSnapshot } from "./storage.types";

const SIGNED_OUT: StorageSnapshot = {
  auth: { status: AUTH_STATUS.signedOut },
  units: [],
  loadingUnits: false,
  transfer: { status: "idle" },
  revision: 0,
};
const REFETCH_DEBOUNCE_MS = 600;

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

export type RemoteData<T> =
  | { readonly status: "loading" }
  | { readonly status: "error"; readonly message: string }
  | { readonly status: "ready"; readonly data: T };

/**
 * GETs `path`, refetching (debounced) when `revision` changes. Previous data
 * stays on screen during a refetch so the UI never flashes empty.
 */
export function useRemoteData<T>(path: string | undefined, revision: number): RemoteData<T> {
  const [state, setState] = useState<RemoteData<T>>({ status: "loading" });
  const first = useRef(true);

  useEffect(() => {
    if (!path) return;
    const controller = new AbortController();
    const delay = first.current ? 0 : REFETCH_DEBOUNCE_MS;
    first.current = false;
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(path, { signal: controller.signal });
        if (!response.ok) throw new Error(await readError(response));
        setState({ status: "ready", data: (await response.json()) as T });
      } catch (error) {
        if (controller.signal.aborted) return;
        setState({
          status: "error",
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }, delay);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [path, revision]);

  return path ? state : { status: "loading" };
}
