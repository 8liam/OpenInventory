export const LOGIN_OUTCOME = {
  iconSize: 14,
  /** Takes focus after a sign-in when the button that opened the dialog is gone. */
  bannerId: "login-outcome",
  bannerClass:
    "flex shrink-0 flex-wrap items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3 outline-offset-2",
  messageClass: "flex min-w-0 items-center gap-2",
  iconClass: { warning: "shrink-0 text-warning", success: "shrink-0 text-success" },
  actionsClass: "flex gap-2",
} as const;
