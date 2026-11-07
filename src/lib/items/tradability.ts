import type { ItemView } from "./item.types.ts";
import type { TradabilityGroup } from "./tradability.types.ts";

const DAY_MS = 24 * 60 * 60 * 1000;

function localDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** Groups future lock dates by calendar day or Monday-starting week, ordered chronologically. */
export function groupUpcomingUnlocks(
  items: readonly ItemView[],
  now: number,
  period: "day" | "week" = "day",
): readonly TradabilityGroup[] {
  const groups = new Map<string, { label: string; items: ItemView[]; timestamp: number }>();
  for (const item of items) {
    if (item.tradableAfter === null || item.tradableAfter <= now) continue;
    const unlock = localDay(new Date(item.tradableAfter));
    const start = new Date(unlock);
    if (period === "week") start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    const key = dayKey(start);
    const group = groups.get(key) ?? {
      label: start.toLocaleDateString(undefined, { dateStyle: "medium" }),
      items: [],
      timestamp: start.getTime(),
    };
    group.items.push(item);
    groups.set(key, group);
  }
  return [...groups]
    .sort(([, a], [, b]) => a.timestamp - b.timestamp)
    .map(([key, group]) => ({ key, label: group.label, items: group.items }));
}

export function daysUntilUnlock(unlockAt: number, now: number): number {
  return Math.max(
    0,
    Math.ceil(
      (localDay(new Date(unlockAt)).getTime() - localDay(new Date(now)).getTime()) / DAY_MS,
    ),
  );
}
