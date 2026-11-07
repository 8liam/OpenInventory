/** Stable key for an item across accounts and locations (asset ids are unique, location ids only per account). */
export function itemRowKey(item: {
  readonly accountId: string;
  readonly locationId: string;
  readonly id: string;
}): string {
  return `${item.accountId}:${item.locationId}:${item.id}`;
}
