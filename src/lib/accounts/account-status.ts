import { COPY } from "~/lib/copy/copy.config";
import { AUTH_STATUS } from "~/lib/storage/storage.config";
import type { AuthState } from "~/lib/storage/storage.types";

/** Short state of an account's connection, for lists and the switcher. */
export function authStatusText(auth: AuthState): string {
  const status = COPY.accounts.status;
  switch (auth.status) {
    case AUTH_STATUS.ready:
      return status.ready;
    case AUTH_STATUS.idle:
      return status.idle;
    case AUTH_STATUS.connecting:
      return status.connecting;
    case AUTH_STATUS.error:
      return status.error;
    case AUTH_STATUS.qrPending:
      return status.qrPending;
    case AUTH_STATUS.signedOut:
      return status.signedOut;
  }
}

/** Tailwind background for the status dot beside an account. */
export function authDotClass(auth: AuthState): string {
  if (auth.status === AUTH_STATUS.ready) return "bg-success";
  if (auth.status === AUTH_STATUS.error) return "bg-destructive";
  return "bg-warning";
}
