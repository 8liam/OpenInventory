import type { AUTH_STATUS } from "./storage.config";

export type AuthState =
  | { readonly status: typeof AUTH_STATUS.signedOut }
  | { readonly status: typeof AUTH_STATUS.qrPending; readonly qrSvg: string }
  | { readonly status: typeof AUTH_STATUS.connecting; readonly detail: string }
  | {
      readonly status: typeof AUTH_STATUS.ready;
      /** Steam persona name; null until Steam reports it. The login name is never sent to the browser. */
      readonly displayName: string | null;
    }
  | { readonly status: typeof AUTH_STATUS.error; readonly message: string };

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

export type TransferState =
  | { readonly status: "idle" }
  | {
      readonly status: "running";
      readonly total: number;
      readonly done: number;
      readonly fromName: string;
      readonly toName: string;
    }
  | {
      readonly status: "finished";
      readonly total: number;
      readonly done: number;
      readonly fromName: string;
      readonly toName: string;
      readonly cancelled: boolean;
      readonly failures: readonly TransferFailure[];
    };

/** Move items between the inventory and/or storage units (location ids; see INVENTORY_LOCATION_ID). */
export type TransferRequest = {
  readonly from: string;
  readonly to: string;
  readonly itemIds: readonly string[];
};

export type RenameUnitRequest = {
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
  /** Bumps whenever inventory or tracked contents change, to trigger refetches. */
  readonly revision: number;
};

/** Error payload shared by every non-2xx API response. */
export type ApiError = { readonly error: string };
