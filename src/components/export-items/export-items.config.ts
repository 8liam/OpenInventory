export const EXPORT_ITEMS = {
  label: "Export CSV",
  description: "Download the items shown by the current filters",
  mimeType: "text/csv;charset=utf-8",
  /** Keeps the blob URL alive until the browser has started the download (Safari reads it late). */
  revokeDelayMs: 10_000,
} as const;
