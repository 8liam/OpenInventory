/** Stable key for an item across locations (the same asset id never appears in two places). */
export function itemRowKey(item: { readonly locationId: string; readonly id: string }): string {
  return `${item.locationId}:${item.id}`;
}
