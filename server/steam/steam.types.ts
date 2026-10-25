import type { GcItem } from "globaloffensive";
import type { StorageSnapshot, TransferRequest } from "../../src/lib/storage/storage.types.ts";

export type { GcItem };

export type SnapshotListener = (snapshot: StorageSnapshot) => void;

export type UnitContents = {
  readonly id: string;
  readonly name: string;
  readonly items: readonly GcItem[];
};

export type StorageGateway = {
  readonly getSnapshot: () => StorageSnapshot;
  readonly subscribe: (listener: SnapshotListener) => () => void;
  readonly startQrLogin: () => Promise<void>;
  readonly logout: () => void;
  /** Loose inventory items (storage units and their contents excluded). */
  readonly getInventory: () => readonly GcItem[];
  /** Contents of every loaded unit. */
  readonly getUnits: () => readonly UnitContents[];
  /** Re-reads every unit from the Game Coordinator (skips unchanged ones unless forced). */
  readonly refreshUnits: (force: boolean) => Promise<void>;
  /** Invoked once the account is connected and units are known. */
  /** Validates and queues a move; resolves once it has started. Progress is in the snapshot. */
  readonly transferItems: (request: TransferRequest) => void;
  /** Renames a storage unit and resolves once the GC reports the new name. */
  readonly renameUnit: (unitId: string, name: string) => Promise<void>;
  /** Activates a sealed Terminal. Irreversible; resolves once the GC confirms it. */
  readonly activateTerminal: (terminalId: string) => Promise<void>;
  /** Asks the GC to present an active Terminal's current offer and returns the offered items. Read-only. */
  /** Moves an active Terminal on to its next offer. Irreversible; returns the new offered items. */
  readonly requestNextOffer: (terminalId: string) => Promise<readonly GcItem[]>;
  readonly getTerminalOffer: (terminalId: string) => Promise<readonly GcItem[]>;
  readonly cancelTransfer: () => void;
  readonly dismissTransfer: () => void;
  readonly onReady: (listener: (steamId: string) => void) => void;
  readonly getSteamId: () => string | undefined;
  /** Steam Community cookies (`name=value`), for fetching pages that have no GC equivalent. */
  readonly getWebCookies: (refresh: boolean) => Promise<readonly string[]>;
};

export class UserFacingError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
