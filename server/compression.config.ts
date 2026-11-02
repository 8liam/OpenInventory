export const COMPRESSION = {
  /** Bodies at or below this size cost more to compress than they save. */
  minBytes: 1024,
  encoding: "gzip",
  /** Only text-like payloads shrink; images and fonts are already compressed. */
  compressibleTypes: /^(text\/|application\/json|image\/svg\+xml)/,
  /** Matches `gzip` (or `*`) in Accept-Encoding unless refused with q=0. */
  acceptPattern: /(?:^|[\s,])(?:gzip|\*)\s*(?:;\s*q=(?!0(?:\.0*)?(?:,|$))[\d.]+)?\s*(?:,|$)/i,
} as const;
