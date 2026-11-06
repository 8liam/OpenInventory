/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { itemsToCsv } from "./export-csv.ts";
import type { ItemView } from "./item.types.ts";

const item: ItemView = {
  id: "123",
  name: 'AK-47 | Redline, "Field-Tested"',
  marketHashName: null,
  imageUrl: null,
  rarityColor: null,
  rarityName: "Classified",
  category: "Rifle",
  customName: "=SUM(1,2)",
  wear: 0.15,
  wearName: "Field-Tested",
  isStatTrak: false,
  isSouvenir: false,
  stickers: [{ name: "Sticker A", imageUrl: null }],
  charms: [],
  pattern: null,
  videoUrl: null,
  terminal: null,
  tradableAfter: null,
  price: 12.5,
  locationId: "unit-1",
  locationName: "Main storage",
};

test("exports filtered item fields with spreadsheet-safe escaping", () => {
  const csv = itemsToCsv([item], "USD");
  assert.ok(csv.startsWith("\uFEFF"));
  assert.match(csv, /"AK-47 \| Redline, ""Field-Tested"""/);
  assert.match(csv, /"'=SUM\(1,2\)"/);
  assert.match(csv, /"Main storage","12.5","USD"/);
  assert.equal(csv.trimEnd().split("\r\n").length, 2);
});

test("every formula trigger is escaped, even behind leading whitespace", () => {
  for (const customName of ["+1", "-1", "@SUM(A1)", "\t=cmd", " =1+1"]) {
    const csv = itemsToCsv([{ ...item, customName }], "USD");
    assert.ok(csv.includes(`"'${customName.replaceAll('"', '""')}"`), JSON.stringify(customName));
  }
  assert.ok(itemsToCsv([item], "USD").includes('"Sticker A"'), "plain text is left alone");
});
