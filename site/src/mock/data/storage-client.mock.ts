import { AUTH_STATUS } from "~/lib/storage/storage.config";
import type { AppSnapshot, TransferRequest } from "~/lib/storage/storage.types";

type Handler = (request: TransferRequest) => Promise<void>;

let handler: Handler | undefined;

/** The demo registers how a "move" is simulated; nothing here ever leaves the browser. */
export function setTransferHandler(next: Handler | undefined): void {
  handler = next;
}

export async function postJson(_path: string, body: unknown): Promise<void> {
  await handler?.(body as TransferRequest);
}

/** The demo has no live server: no tracked accounts, so components fall back to single-account copy. */
const DEMO_SNAPSHOT: AppSnapshot = {
  accounts: [],
  login: { status: AUTH_STATUS.signedOut },
  lastLogin: null,
  revision: 0,
};

export function useAppSnapshot(): AppSnapshot {
  return DEMO_SNAPSHOT;
}
