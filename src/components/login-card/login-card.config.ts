export const LOGIN_CARD = {
  /** Its own card on the first-run screen; unframed inside a dialog, which is already the surface. */
  frameClass: "rounded-lg border bg-card p-6",
  headingClass: "text-[15px] font-semibold tracking-tight",
  bodyClass: "mt-1.5 text-muted-foreground",
  /** White behind the QR code in both themes, so phone cameras read it. */
  qrClass: "mx-auto mt-5 size-52 rounded-md bg-white p-2 [&>svg]:size-full",
  waitingClass: "mt-3 text-center text-xs text-muted-foreground",
  detailClass: "mt-5 text-muted-foreground",
  errorClass: "mt-4 text-destructive",
  buttonClass: "mt-5 w-full",
} as const;
