import { AUTH_STATUS } from "../../src/lib/storage/storage.config.ts";
import type {
  AuthState,
  StorageSnapshot,
  StorageUnit,
  TransferState,
} from "../../src/lib/storage/storage.types.ts";
import type { SnapshotListener } from "./steam.types.ts";

export type UnitMeta = Omit<StorageUnit, "loaded">;

/** Shared mutable state + pub/sub. Broadcasts are tiny: item data is fetched on demand. */
export function createSnapshotStore() {
  let auth: AuthState = { status: AUTH_STATUS.signedOut };
  let units: readonly UnitMeta[] = [];
  let loadingUnits = false;
  let transfer: TransferState = { status: "idle" };
  let syncError: string | null = null;
  let revision = 0;
  const loaded = new Set<string>();
  const listeners = new Set<SnapshotListener>();
  let emitScheduled = false;

  function getSnapshot(): StorageSnapshot {
    return {
      auth,
      units: units.map((unit) => ({ ...unit, loaded: loaded.has(unit.id) })),
      loadingUnits,
      transfer,
      syncError,
      revision,
    };
  }

  /** Coalesces bursts (e.g. hundreds of GC item events) into one broadcast per tick. */
  function emit(): void {
    revision += 1;
    if (emitScheduled) return;
    emitScheduled = true;
    setImmediate(() => {
      emitScheduled = false;
      const snapshot = getSnapshot();
      for (const listener of listeners) listener(snapshot);
    });
  }

  return {
    getSnapshot,
    subscribe(listener: SnapshotListener): () => void {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setAuth(next: AuthState): void {
      auth = next;
      emit();
    },
    setUnits(next: readonly UnitMeta[]): void {
      units = next;
      for (const id of [...loaded]) if (!next.some((unit) => unit.id === id)) loaded.delete(id);
      emit();
    },
    markLoaded(unitId: string): void {
      loaded.add(unitId);
      emit();
    },
    setTransfer(next: TransferState): void {
      transfer = next;
      emit();
    },
    getTransfer: (): TransferState => transfer,
    setSyncError(next: string | null): void {
      if (syncError === next) return;
      syncError = next;
      emit();
    },
    setLoadingUnits(next: boolean): void {
      loadingUnits = next;
      emit();
    },
    touch: emit,
    reset(): void {
      auth = { status: AUTH_STATUS.signedOut };
      units = [];
      loadingUnits = false;
      transfer = { status: "idle" };
      syncError = null;
      loaded.clear();
      emit();
    },
    units: (): readonly UnitMeta[] => units,
  };
}
