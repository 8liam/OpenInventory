import { EVENT_TEXT, ITEM_TAGS, RARITY_COLOR, TRADE_UP_INPUT_COUNTS } from "./cases.config.ts";
import type { EventKind, HistoryEvent, HistoryItem } from "./cases.types.ts";

function isWeapon(item: HistoryItem): boolean {
  const { type } = item;
  if (!type) return false;
  if (type === ITEM_TAGS.gloves || type === ITEM_TAGS.knife) return true;
  return (
    type.startsWith(ITEM_TAGS.weaponPrefix) &&
    type !== ITEM_TAGS.weaponCase &&
    type !== ITEM_TAGS.stickerTool
  );
}

/** A ★ knife or glove pulled in red: the top-tier drop. */
export function isGold(item: HistoryItem): boolean {
  return item.color === RARITY_COLOR.gold && item.name.includes(ITEM_TAGS.starName);
}

/** What an inventory-history event represents, judged from its wording and items. */
export function classifyEvent(event: HistoryEvent): EventKind {
  const [reward] = event.gained;
  if (event.description.includes(EVENT_TEXT.unlocked)) {
    const opened = event.lost.some((item) => item.type === ITEM_TAGS.weaponCase);
    if (reward && isWeapon(reward) && opened) {
      return reward.name.includes(ITEM_TAGS.souvenirName) ? "souvenir" : "case";
    }
    if (reward?.type === ITEM_TAGS.stickerTool) return "capsule";
    return "other";
  }
  if (
    event.description.includes(EVENT_TEXT.crafted) &&
    TRADE_UP_INPUT_COUNTS.includes(event.lost.length) &&
    event.gained.length === 1
  ) {
    return "tradeUp";
  }
  if (EVENT_TEXT.drops.some((text) => event.description.includes(text)) && reward) return "drop";
  return "other";
}
