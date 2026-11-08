import { useSyncExternalStore } from "react";
import type { StaleDataState, StaleLoad } from "./storage.types";

// Failed refreshes and dropped live streams, kept apart from the snapshot store so the banner
// that reads them re-renders on its own. Pages keep showing their last good data meanwhile.

const loads = new Map<symbol, StaleLoad>();
const listeners = new Set<() => void>();
let state: StaleDataState = { reconnecting: false, lastSnapshotAt: null, staleLoads: [] };

function update(next: Partial<StaleDataState>): void {
  state = { ...state, ...next };
  for (const listener of listeners) listener();
}

/** Records that `key`'s refresh failed while its earlier data stays on screen. */
export function markStale(key: symbol, load: StaleLoad): void {
  loads.set(key, load);
  update({ staleLoads: [...loads.values()] });
}

/** `key` loaded fresh data again (or went away), so it no longer counts as stale. */
export function clearStale(key: symbol): void {
  if (!loads.delete(key)) return;
  update({ staleLoads: [...loads.values()] });
}

/** Tracks the live stream for the banner: dropped after data arrived, and when data last arrived. */
export function setStreamState(reconnecting: boolean, lastSnapshotAt: number | null): void {
  if (state.reconnecting === reconnecting && state.lastSnapshotAt === lastSnapshotAt) return;
  update({ reconnecting, lastSnapshotAt });
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Whether anything on screen is older than it should be, and since when. */
export function useStaleData(): StaleDataState {
  return useSyncExternalStore(subscribe, () => state);
}
