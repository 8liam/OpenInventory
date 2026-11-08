/** The muted line of a compact row: whichever of the location and the (already formatted) float are known. */
export function joinDetail(parts: readonly (string | null)[], separator: string): string {
  return parts.filter((part): part is string => part !== null && part !== "").join(separator);
}
