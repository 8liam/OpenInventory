import { IMAGE_SIZE_SUFFIX } from "../../src/lib/storage/storage.config.ts";
import { OPENING_KINDS } from "../../src/lib/cases/cases.config.ts";
import type {
  CaseOpening,
  CaseStats,
  OpeningKind,
  PulledItem,
  RaritySlice,
} from "../../src/lib/cases/cases.types.ts";
import { CASE_STATS, ITEM_TAGS, RARITY_BUCKETS, RARITY_COLOR } from "./cases.config.ts";
import type { EventKind, HistoryEvent, HistoryItem } from "./cases.types.ts";
import { classifyEvent, isGold } from "./history-classify.ts";

const ECONOMY_IMAGE_BASE = "https://community.fastly.steamstatic.com/economy/image/";

function imageUrl(item: HistoryItem | undefined): string | null {
  return item?.icon ? `${ECONOMY_IMAGE_BASE}${item.icon}${IMAGE_SIZE_SUFFIX}` : null;
}

function bucketKey(item: HistoryItem): (typeof RARITY_BUCKETS)[number]["key"] {
  if (isGold(item)) return "gold";
  switch (item.color) {
    case RARITY_COLOR.covert:
      return "covert";
    case RARITY_COLOR.classified:
      return "classified";
    case RARITY_COLOR.restricted:
      return "restricted";
    case RARITY_COLOR.milSpec:
      return "milSpec";
    default:
      return "other";
  }
}

/** Lower is rarer: gold first, then by the in-game rarity colour, unknown colours last. */
function rarityRank(opening: CaseOpening): number {
  if (opening.isGold) return 0;
  const index = RARITY_BUCKETS.findIndex((b) => b.key !== "gold" && b.color === opening.color);
  return index < 0 ? RARITY_BUCKETS.length : index;
}

function monthKey(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/** The container an opening consumed (not its key); trade-ups and drops have no single source. */
function sourceOf(event: HistoryEvent, kind: OpeningKind): HistoryItem | undefined {
  if (kind === "tradeUp" || kind === "drop") return undefined;
  return event.lost.find((item) => item.type !== ITEM_TAGS.caseKey);
}

function tally(entries: readonly (readonly [string, HistoryItem])[], limit: number): PulledItem[] {
  const counts = new Map<string, { item: HistoryItem; count: number }>();
  for (const [name, item] of entries) {
    const entry = counts.get(name);
    if (entry) entry.count += 1;
    else counts.set(name, { item, count: 1 });
  }
  return [...counts.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, limit)
    .map(([name, { item, count }]) => ({
      name,
      imageUrl: imageUrl(item),
      color: item.color,
      count,
    }));
}

/** Month counts oldest first, with the months in between that had no openings as zeros. */
function withEmptyMonths(counts: ReadonlyMap<string, number>): { month: string; count: number }[] {
  const keys = [...counts.keys()].sort();
  const first = keys[0];
  const last = keys[keys.length - 1];
  if (!first || !last) return [];
  const result: { month: string; count: number }[] = [];
  const [startYear = 0, startMonth = 1] = first.split("-").map(Number);
  let cursor = new Date(startYear, startMonth - 1, 1);
  for (;;) {
    const key = monthKey(cursor.getTime());
    result.push({ month: key, count: counts.get(key) ?? 0 });
    if (key === last) return result;
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
  }
}

/** Everything the Cases page shows, computed from the stored history (newest first). */
export function buildCaseStats(events: readonly HistoryEvent[], kind: OpeningKind): CaseStats {
  const kinds = new Map<EventKind, HistoryEvent[]>();
  for (const event of events) {
    const eventKind = classifyEvent(event);
    kinds.set(eventKind, [...(kinds.get(eventKind) ?? []), event]);
  }
  const cases = kinds.get(kind) ?? []; // newest first
  const openings: CaseOpening[] = cases.flatMap((event) => {
    const [reward] = event.gained;
    if (!reward) return [];
    return [
      {
        itemName: reward.name,
        imageUrl: imageUrl(reward),
        color: reward.color,
        isStatTrak: reward.statTrak,
        isGold: isGold(reward),
        caseName: sourceOf(event, kind)?.name ?? null,
        openedAt: event.occurredAt,
      },
    ];
  });

  const goldIndexNewestFirst = openings.findIndex((o) => o.isGold);
  const goldIndexOldestFirst = openings.map((o) => o.isGold).lastIndexOf(true);
  const rarityCounts = new Map<string, number>();
  for (const event of cases) {
    const reward = event.gained[0];
    if (reward) rarityCounts.set(bucketKey(reward), (rarityCounts.get(bucketKey(reward)) ?? 0) + 1);
  }
  const rarity: RaritySlice[] = RARITY_BUCKETS.map((bucket) => ({
    label: bucket.label,
    color: bucket.color,
    count: rarityCounts.get(bucket.key) ?? 0,
  })).filter((slice) => slice.count > 0);

  const perMonth = new Map<string, number>();
  for (const opening of [...openings].reverse()) {
    const key = monthKey(opening.openedAt);
    perMonth.set(key, (perMonth.get(key) ?? 0) + 1);
  }
  const kindCounts = Object.fromEntries(
    OPENING_KINDS.map((k) => [k, kinds.get(k)?.length ?? 0]),
  ) as Record<OpeningKind, number>;

  return {
    kind,
    kindCounts,
    total: openings.length,
    gold: openings.filter((o) => o.isGold).length,
    statTrak: openings.filter((o) => o.isStatTrak).length,
    firstOpenedAt: openings[openings.length - 1]?.openedAt ?? null,
    lastOpenedAt: openings[0]?.openedAt ?? null,
    casesSinceGold:
      kind !== "case" || openings.length === 0
        ? null
        : goldIndexNewestFirst < 0
          ? openings.length
          : goldIndexNewestFirst,
    casesToFirstGold: goldIndexOldestFirst < 0 ? null : openings.length - goldIndexOldestFirst,
    rarity,
    rarest: openings
      .map((opening, index) => ({ opening, index, rank: rarityRank(opening) }))
      .sort((a, b) => a.rank - b.rank || a.index - b.index) // ties keep newest first
      .slice(0, CASE_STATS.rarestCount)
      .map((entry) => entry.opening),
    topItems: tally(
      cases.flatMap((e) => (e.gained[0] ? [[e.gained[0].name, e.gained[0]] as const] : [])),
      CASE_STATS.topItemCount,
    ),
    topCases: tally(
      cases.flatMap((e) => {
        const source = sourceOf(e, kind);
        return source ? [[source.name, source] as const] : [];
      }),
      CASE_STATS.topCaseCount,
    ),
    perMonth: withEmptyMonths(perMonth),
    recent: openings.slice(0, CASE_STATS.recentCount),
  };
}
