import type { Account } from "../accounts/accounts.types.ts";
import type { AUTH_STATUS, REMOTE_STATUS, SNAPSHOT_CONNECTION } from "./storage.config.ts";

export type AuthState =
  | { readonly status: typeof AUTH_STATUS.signedOut }
  | { readonly status: typeof AUTH_STATUS.idle }
  | { readonly status: typeof AUTH_STATUS.qrPending; readonly qrSvg: string }
  | { readonly status: typeof AUTH_STATUS.connecting; readonly detail: string }
  | {
      readonly status: typeof AUTH_STATUS.ready;
      /** Steam persona name; null until Steam reports it. The login name is never sent to the browser. */
      readonly displayName: string | null;
    }
  | { readonly status: typeof AUTH_STATUS.error; readonly message: string };

export type AuthStatus = AuthState["status"];

export type StorageUnit = {
  readonly id: string;
  readonly name: string;
  readonly itemCount: number;
  /** True once the unit's contents are available (live or restored from cache). */
  readonly loaded: boolean;
};

export type TransferFailure = {
  readonly itemId: string;
  readonly name: string;
  readonly reason: string;
};

/** Where an organiser plan is: the step being run and how many there are. */
export type PlanProgress = { readonly step: number; readonly steps: number };

export type TransferState =
  | { readonly status: "idle" }
  | {
      readonly status: "running";
      readonly total: number;
      readonly done: number;
      readonly fromName: string;
      readonly toName: string;
      /** Set while an organiser plan is running; null for a single move. */
      readonly plan: PlanProgress | null;
    }
  | {
      readonly status: "finished";
      readonly total: number;
      readonly done: number;
      readonly fromName: string;
      readonly toName: string;
      readonly cancelled: boolean;
      readonly failures: readonly TransferFailure[];
      readonly plan: PlanProgress | null;
    };

/** Move items between the inventory and/or storage units (location ids; see INVENTORY_LOCATION_ID). */
export type TransferRequest = AccountScoped & {
  readonly from: string;
  readonly to: string;
  readonly itemIds: readonly string[];
};

/** Every mutating request names the account it acts on; the server has no "current" account. */
export type AccountScoped = { readonly accountId: string };

export type ActivateTerminalRequest = AccountScoped & {
  readonly id: string;
};

export type RenameUnitRequest = AccountScoped & {
  readonly id: string;
  readonly name: string;
};

/** Light-weight state pushed over SSE; item lists are fetched on demand. */
export type StorageSnapshot = {
  readonly auth: AuthState;
  readonly units: readonly StorageUnit[];
  /** True while storage units are being (re)loaded from the Game Coordinator. */
  readonly loadingUnits: boolean;
  readonly transfer: TransferState;
  /** Why the last CS2 session request failed (e.g. CS2 is running elsewhere); null when healthy. */
  readonly syncError: string | null;
  /** Bumps whenever inventory or tracked contents change, to trigger refetches. */
  readonly revision: number;
};

/** One tracked account and the live state of its Steam/GC connection. */
export type AccountState = Account & {
  /** Steam persona name; null until Steam reports it. */
  readonly displayName: string | null;
  readonly snapshot: StorageSnapshot;
};

/** How the most recent QR sign-in ended, so the dialog that started it can say what happened. */
export type LoginResult = {
  /** Increases with every finished sign-in, so signing in to the same account twice still reads as new. */
  readonly sequence: number;
  readonly steamId: string;
  /** True when the account wasn't tracked before; false when an existing one signed in again. */
  readonly added: boolean;
};

/** Everything the browser needs to render: all accounts, plus the add-account login in progress. */
export type AppSnapshot = {
  readonly accounts: readonly AccountState[];
  /** The QR login being run to add an account (signed-out when none is). */
  readonly login: AuthState;
  /** The last sign-in that finished since the server started; null before any has. */
  readonly lastLogin: LoginResult | null;
  /** Bumps whenever anything in the snapshot changes. */
  readonly revision: number;
};

/** Error payload shared by every non-2xx API response. */
export type ApiError = { readonly error: string };

export type SnapshotConnection = (typeof SNAPSHOT_CONNECTION)[keyof typeof SNAPSHOT_CONNECTION];

/** A GET that may still be loading, may have failed (with a way to try again), or has data. */
export type RemoteData<T> =
  | { readonly status: typeof REMOTE_STATUS.loading }
  | {
      readonly status: typeof REMOTE_STATUS.error;
      readonly message: string;
      readonly retry: () => void;
      /** True from Retry until the next response, so the error stays mounted (and focused) meanwhile. */
      readonly retrying: boolean;
    }
  | { readonly status: typeof REMOTE_STATUS.ready; readonly data: T };

/** A page load whose refresh failed while its last good data stays on screen. */
export type StaleLoad = {
  readonly message: string;
  /** When the data on screen was fetched (epoch ms). */
  readonly lastSuccessAt: number;
  /** Fetches again at once, keeping the data on screen meanwhile. */
  readonly refresh: () => void;
};

/** What the stale-data banner needs: whether the live stream dropped and which loads failed. */
export type StaleDataState = {
  /** The live event stream dropped after data arrived and is being re-established. */
  readonly reconnecting: boolean;
  /** When the last live snapshot arrived (epoch ms), or null before any did. */
  readonly lastSnapshotAt: number | null;
  readonly staleLoads: readonly StaleLoad[];
};
