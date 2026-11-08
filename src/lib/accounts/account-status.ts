import { COPY } from "~/lib/copy/copy.config";
import { AUTH_STATUS } from "~/lib/storage/storage.config";
import type { AuthStatus } from "~/lib/storage/storage.types";

/** Short state of an account's connection, for lists and the switcher. */
export function authStatusText(status: AuthStatus): string {
  const text = COPY.accounts.status;
  switch (status) {
    case AUTH_STATUS.ready:
      return text.ready;
    case AUTH_STATUS.idle:
      return text.idle;
    case AUTH_STATUS.connecting:
      return text.connecting;
    case AUTH_STATUS.error:
      return text.error;
    case AUTH_STATUS.qrPending:
      return text.qrPending;
    case AUTH_STATUS.signedOut:
      return text.signedOut;
  }
}
