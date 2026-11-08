export const EXPORT_ITEMS = {
  label: "Export CSV",
  jsonLabel: "Export JSON",
  jsonMimeType: "application/json;charset=utf-8",
  iconSize: 12,
  /** Small on desktop; 36px tall on phones so each is an easy tap. */
  buttonClass: "max-sm:h-9",
  description: "Download the items shown by the current filters",
  mimeType: "text/csv;charset=utf-8",
  /** Keeps the blob URL alive until the browser has started the download (Safari reads it late). */
  revokeDelayMs: 10_000,
} as const;
