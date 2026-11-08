import { AUTH_STATUS } from "~/lib/storage/storage.config";

/** Dot colour per connection state; anything still on its way to connected is amber. */
export const ACCOUNT_STATUS_DOT = {
  base: "size-1.5 shrink-0 rounded-full",
  classes: {
    [AUTH_STATUS.ready]: "bg-success",
    [AUTH_STATUS.error]: "bg-destructive",
    [AUTH_STATUS.idle]: "bg-warning",
    [AUTH_STATUS.connecting]: "bg-warning",
    [AUTH_STATUS.qrPending]: "bg-warning",
    [AUTH_STATUS.signedOut]: "bg-warning",
  },
} as const;
