/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { reasonsByItemKey } from "./sell-suggestions.ts";
import type { SellSuggestion } from "./sell-suggestions.types.ts";

test("each item key collects every reason that covers it", () => {
  const suggestions: SellSuggestion[] = [
    {
      key: "AK",
      name: "AK",
      imageUrl: null,
      rarityColor: null,
      reasons: [
        { kind: "spike", change: 0.3, itemKeys: ["inventory:1", "unit-a:2"] },
        { kind: "idle-stack", unitPrice: 0.5, itemKeys: ["unit-a:2"] },
      ],
    },
  ];
  const byKey = reasonsByItemKey(suggestions);
  assert.deepEqual(
    byKey.get("inventory:1")?.map((r) => r.kind),
    ["spike"],
  );
  assert.deepEqual(
    byKey.get("unit-a:2")?.map((r) => r.kind),
    ["spike", "idle-stack"],
  );
  assert.equal(byKey.get("missing"), undefined);
});
