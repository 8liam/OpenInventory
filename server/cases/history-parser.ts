import { parse, type HTMLElement } from "node-html-parser";
import {
  HISTORY_API,
  HISTORY_DATE,
  HISTORY_SELECTORS,
  HISTORY_SIGN,
  ITEM_TAGS,
} from "./cases.config.ts";
import type { HistoryEvent, HistoryItem, HistoryPage } from "./cases.types.ts";

type Tag = {
  readonly category?: string;
  readonly internal_name?: string;
  readonly name?: string;
  readonly color?: string;
};
type Description = {
  readonly name?: string;
  readonly icon_url?: string;
  readonly tags?: readonly Tag[];
};

const APP_KEY = String(HISTORY_API.appId);

function tagOf(description: Description, category: string): Tag | undefined {
  return description.tags?.find((tag) => tag.category === category);
}

function toItem(description: Description, fallbackName: string): HistoryItem {
  return {
    name: description.name ?? fallbackName,
    icon: description.icon_url ?? null,
    color: tagOf(description, ITEM_TAGS.rarity)?.color ?? null,
    type: tagOf(description, ITEM_TAGS.type)?.internal_name ?? null,
    wear: tagOf(description, ITEM_TAGS.exterior)?.name ?? null,
    statTrak: tagOf(description, ITEM_TAGS.quality)?.name === ITEM_TAGS.statTrak,
    collection: tagOf(description, ITEM_TAGS.itemSet)?.name ?? null,
  };
}

/** "23 Sep, 2026" + "9:51pm" -> epoch ms in the server's zone (matching the zone cookie we send). */
export function parseHistoryDate(dateText: string, timeText: string): number | undefined {
  const date = HISTORY_DATE.datePattern.exec(dateText.trim());
  const time = HISTORY_DATE.timePattern.exec(timeText.trim());
  if (!date || !time) return undefined;
  const month = HISTORY_DATE.months.findIndex((m) => m.toLowerCase() === date[2]?.toLowerCase());
  if (month < 0) return undefined;
  let hours = Number(time[1]) % 12;
  if (time[3]?.toLowerCase() === "pm") hours += 12;
  return new Date(Number(date[3]), month, Number(date[1]), hours, Number(time[2])).getTime();
}

function itemsOf(
  group: HTMLElement,
  descriptions: Readonly<Record<string, unknown>>,
): HistoryItem[] {
  return group.querySelectorAll(HISTORY_SELECTORS.item).flatMap((element) => {
    if (element.getAttribute("data-appid") !== APP_KEY) return [];
    const key = `${element.getAttribute("data-classid")}_${element.getAttribute("data-instanceid")}`;
    const description = descriptions[key] as Description | undefined;
    const fallback = element.querySelector(HISTORY_SELECTORS.itemName)?.text.trim() ?? key;
    return [toItem(description ?? {}, fallback)];
  });
}

/** Reads every CS2 event on a page, newest first. Rows without CS2 items are dropped. */
export function parseHistoryPage(page: HistoryPage): HistoryEvent[] {
  const descriptions = page.descriptions[APP_KEY] ?? {};
  const events: HistoryEvent[] = [];
  for (const row of parse(page.html).querySelectorAll(HISTORY_SELECTORS.row)) {
    const description = row.querySelector(HISTORY_SELECTORS.description)?.text.trim();
    const dateCell = row.querySelector(HISTORY_SELECTORS.date);
    const timeText = dateCell?.querySelector(HISTORY_SELECTORS.time)?.text ?? "";
    const dateText = (dateCell?.childNodes[0]?.text ?? "").trim();
    const occurredAt = parseHistoryDate(dateText, timeText);
    const firstItemId = row.querySelector(`${HISTORY_SELECTORS.item}[id]`)?.getAttribute("id");
    if (!description || occurredAt === undefined || !firstItemId) continue;

    const gained: HistoryItem[] = [];
    const lost: HistoryItem[] = [];
    for (const group of row.querySelectorAll(HISTORY_SELECTORS.itemGroup)) {
      const sign = group.querySelector(HISTORY_SELECTORS.sign)?.text.trim();
      if (sign === HISTORY_SIGN.gained) gained.push(...itemsOf(group, descriptions));
      else if (sign === HISTORY_SIGN.lost) lost.push(...itemsOf(group, descriptions));
    }
    if (gained.length === 0 && lost.length === 0) continue;
    events.push({
      id: firstItemId.split("_")[0] ?? firstItemId,
      occurredAt,
      description,
      lost,
      gained,
    });
  }
  return events;
}
