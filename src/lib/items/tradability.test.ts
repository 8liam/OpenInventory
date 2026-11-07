import assert from "node:assert/strict";
/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import { test } from "node:test";
import type { ItemView } from "./item.types.ts";
import { daysUntilUnlock, groupUpcomingUnlocks } from "./tradability.ts";

function item(id: string, tradableAfter: number | null): ItemView {
  return {
    id,
    name: id,
    marketHashName: null,
    imageUrl: null,
    rarityColor: null,
    rarityName: null,
    category: "Weapon",
    customName: null,
    wear: null,
    wearName: null,
    isStatTrak: false,
    isSouvenir: false,
    stickers: [],
    charms: [],
    pattern: null,
    videoUrl: null,
    terminal: null,
    tradableAfter,
    price: null,
    locationId: "inventory",
    locationName: "Inventory",
  };
}

test("groups only future unlock dates by local day in chronological order", () => {
  const now = new Date(2026, 4, 6, 12).getTime();
  const groups = groupUpcomingUnlocks(
    [
      item("later", new Date(2026, 4, 8).getTime()),
      item("now", null),
      item("earlier", new Date(2026, 4, 7).getTime()),
      item("expired", now - 1),
    ],
    now,
  );
  assert.deepEqual(
    groups.map((group) => group.items.map(({ id }) => id)),
    [["earlier"], ["later"]],
  );
});

test("week mode groups dates into Monday-starting weeks", () => {
  const now = new Date(2026, 4, 1).getTime();
  const groups = groupUpcomingUnlocks(
    [
      item("sat", new Date(2026, 4, 2).getTime()),
      item("sun", new Date(2026, 4, 3).getTime()),
      item("mon", new Date(2026, 4, 4).getTime()),
    ],
    now,
    "week",
  );
  assert.deepEqual(
    groups.map((group) => group.items.map(({ id }) => id)),
    [["sat", "sun"], ["mon"]],
  );
});

test("counts calendar days to unlock", () => {
  assert.equal(
    daysUntilUnlock(new Date(2026, 4, 7, 1).getTime(), new Date(2026, 4, 6, 23).getTime()),
    1,
  );
});
