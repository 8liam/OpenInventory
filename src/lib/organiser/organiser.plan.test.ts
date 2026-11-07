/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { INVENTORY_LOCATION_ID } from "../items/item.types.ts";
import { STORAGE_LIMITS } from "../storage/storage.config.ts";
import { CONDITION_KIND, PROBLEM_KIND } from "./organiser.config.ts";
import { computePlan, matchesRule } from "./organiser.plan.ts";
import {
  planRequestSchema,
  rulesSchema,
  type OrganiserRule,
  type PlannerItem,
  type PlannerUnit,
  type RuleCondition,
} from "./organiser.types.ts";

const CAP = STORAGE_LIMITS.unitCapacity;

function item(id: string, location: string, extra: Partial<PlannerItem> = {}): PlannerItem {
  return {
    id,
    name: `Item ${id}`,
    marketHashName: null,
    customName: null,
    category: "Container",
    rarityName: null,
    collections: [],
    locationId: location,
    ...extra,
  };
}

function unit(id: string, itemCount: number, loaded = true): PlannerUnit {
  return { id, name: `Unit ${id}`, itemCount, loaded };
}

function rule(id: string, targetUnitId: string, ...conditions: RuleCondition[]): OrganiserRule {
  return { id, targetUnitId, conditions };
}

const category = (value: string): RuleCondition => ({ kind: CONDITION_KIND.category, value });
const nameHas = (value: string): RuleCondition => ({ kind: CONDITION_KIND.name, value });

const many = (prefix: string, location: string, count: number, extra: Partial<PlannerItem> = {}) =>
  Array.from({ length: count }, (_, i) => item(`${prefix}${i}`, location, extra));

describe("matching", () => {
  it("compares category, rarity and collection case-insensitively and names by substring", () => {
    const skin = item("1", "inventory", {
      name: "AK-47 | Redline",
      category: "Rifle",
      rarityName: "Classified",
      collections: ["The Phoenix Collection"],
    });
    const match = (...c: RuleCondition[]) => matchesRule(skin, rule("r", "u", ...c));
    assert.ok(match(category("rifle")));
    assert.ok(match({ kind: CONDITION_KIND.rarity, value: "classified" }));
    assert.ok(match({ kind: CONDITION_KIND.collection, value: "the phoenix collection" }));
    assert.ok(match(nameHas("redline")));
    assert.ok(!match(category("rif")));
    assert.ok(!match(nameHas("case")));
  });

  it("requires every condition to match", () => {
    const hardened = item("1", "inventory", { name: "Case Hardened", category: "Rifle" });
    const crate = item("2", "inventory", { name: "Chroma Case" });
    const both = rule("r", "u", category("Container"), nameHas("case"));
    assert.ok(!matchesRule(hardened, both));
    assert.ok(matchesRule(crate, both));
  });

  it("matches nothing on a rarity-less item", () => {
    const plain = item("1", "inventory");
    assert.ok(!matchesRule(plain, rule("r", "u", { kind: CONDITION_KIND.rarity, value: "x" })));
  });
});

describe("computePlan", () => {
  it("moves matching inventory items into the target unit", () => {
    const plan = computePlan({
      items: [
        item("1", INVENTORY_LOCATION_ID),
        item("2", INVENTORY_LOCATION_ID, { category: "x" }),
      ],
      units: [unit("u2", 0)],
      rules: [rule("r", "u2", category("Container"))],
    });
    assert.equal(plan.steps.length, 1);
    assert.deepEqual(plan.steps[0], {
      from: INVENTORY_LOCATION_ID,
      to: "u2",
      fromName: "Inventory",
      toName: "Unit u2",
      itemIds: ["1"],
      viaInventory: false,
    });
    assert.equal(plan.itemsToMove, 1);
    assert.equal(plan.gcActions, 1);
    assert.ok(plan.executable);
    assert.deepEqual(plan.unitChanges, [
      { unitId: "u2", name: "Unit u2", before: 0, after: 1, incoming: 1, outgoing: 0 },
    ]);
  });

  it("sends unit-to-unit moves via the inventory and counts both GC actions", () => {
    const plan = computePlan({
      items: [item("1", "u1"), item("2", "u1")],
      units: [unit("u1", 2), unit("u2", 0)],
      rules: [rule("r", "u2", category("Container"))],
    });
    assert.equal(plan.steps[0]?.viaInventory, true);
    assert.equal(plan.gcActions, 4);
    assert.deepEqual(
      plan.unitChanges.map((c) => [c.unitId, c.before, c.after]),
      [
        ["u1", 2, 0],
        ["u2", 0, 2],
      ],
    );
  });

  it("lets the first matching rule win, even when a later rule also matches", () => {
    const plan = computePlan({
      items: [item("1", INVENTORY_LOCATION_ID)],
      units: [unit("a", 0), unit("b", 0)],
      rules: [rule("first", "a", category("Container")), rule("second", "b", nameHas("item"))],
    });
    assert.equal(plan.steps[0]?.to, "a");
    assert.deepEqual(
      plan.ruleReports.map((r) => [r.ruleId, r.matched, r.moving]),
      [
        ["first", 1, 1],
        ["second", 0, 0],
      ],
    );
  });

  it("keeps items already in place out of the plan, and out of later rules' reach", () => {
    const plan = computePlan({
      items: [item("1", "a")],
      units: [unit("a", 1), unit("b", 0)],
      rules: [
        rule("first", "a", category("Container")),
        rule("second", "b", category("Container")),
      ],
    });
    assert.deepEqual(plan.steps, []);
    assert.equal(plan.itemsToMove, 0);
    assert.ok(!plan.executable);
    assert.deepEqual(plan.ruleReports[0], {
      ruleId: "first",
      matched: 1,
      alreadyInPlace: 1,
      moving: 0,
      unplaced: 0,
    });
  });

  it("skips a rule whose target unit is gone and reports it as an error", () => {
    const plan = computePlan({
      items: [item("1", INVENTORY_LOCATION_ID)],
      units: [unit("a", 0)],
      rules: [
        rule("lost", "gone", category("Container")),
        rule("kept", "a", category("Container")),
      ],
    });
    assert.deepEqual(plan.problems, [{ kind: PROBLEM_KIND.targetMissing, ruleId: "lost" }]);
    assert.equal(plan.steps[0]?.to, "a");
    assert.ok(!plan.executable, "an error blocks execution");
  });

  it("blocks the plan while any unit is still loading", () => {
    const plan = computePlan({
      items: [item("1", INVENTORY_LOCATION_ID)],
      units: [unit("a", 0), unit("b", 5, false)],
      rules: [rule("r", "a", category("Container"))],
    });
    assert.deepEqual(plan.problems, [
      { kind: PROBLEM_KIND.unitNotLoaded, unitId: "b", unitName: "Unit b" },
    ]);
    assert.ok(!plan.executable);
  });

  it("places only what fits in a nearly full unit and reports the rest", () => {
    const plan = computePlan({
      items: many("c", INVENTORY_LOCATION_ID, 10),
      units: [unit("a", CAP - 4)],
      rules: [rule("r", "a", category("Container"))],
    });
    assert.equal(plan.itemsToMove, 4);
    assert.deepEqual(plan.steps[0]?.itemIds, ["c0", "c1", "c2", "c3"]);
    assert.deepEqual(plan.problems, [
      { kind: PROBLEM_KIND.targetFull, unitId: "a", unitName: "Unit a", unplaced: 6 },
    ]);
    assert.equal(plan.ruleReports[0]?.unplaced, 6);
    assert.equal(plan.unitChanges[0]?.after, CAP);
    assert.ok(plan.executable, "a warning still lets the placeable part run");
  });

  it("gives scarce room to the earlier rule", () => {
    const plan = computePlan({
      items: [
        item("late", INVENTORY_LOCATION_ID, { name: "zzz" }),
        item("early", INVENTORY_LOCATION_ID, { name: "aaa" }),
      ],
      units: [unit("a", CAP - 1)],
      rules: [rule("one", "a", nameHas("aaa")), rule("two", "a", nameHas("zzz"))],
    });
    assert.deepEqual(plan.steps[0]?.itemIds, ["early"]);
  });

  it("counts room freed by items leaving a full unit", () => {
    const plan = computePlan({
      items: [
        ...many("out", "a", 3, { name: "leaver" }),
        ...many("in", INVENTORY_LOCATION_ID, 3, { name: "arrival" }),
      ],
      units: [unit("a", CAP), unit("b", 0)],
      rules: [rule("leave", "b", nameHas("leaver")), rule("arrive", "a", nameHas("arrival"))],
    });
    assert.equal(plan.itemsToMove, 6);
    assert.deepEqual(plan.problems, []);
    const order = plan.steps.map((s) => s.from);
    assert.ok(
      order.indexOf("a") < order.indexOf(INVENTORY_LOCATION_ID),
      "the unit empties before the inventory fills it",
    );
    assert.equal(plan.unitChanges.find((c) => c.unitId === "a")?.after, CAP);
  });

  it("cascades: a rejected leaver keeps taking room in its own unit", () => {
    // b is full and wants nothing out; a wants to push 2 into b and pull 2 from b... but b's
    // leavers go to c which has no room, so they stay, so b stays full, so a's items stay too.
    const plan = computePlan({
      items: [...many("x", "a", 2, { name: "to-b" }), ...many("y", "b", 2, { name: "to-c" })],
      units: [unit("a", 2), unit("b", CAP), unit("c", CAP)],
      rules: [rule("one", "b", nameHas("to-b")), rule("two", "c", nameHas("to-c"))],
    });
    assert.equal(plan.itemsToMove, 0);
    const full = plan.problems.flatMap((p) =>
      p.kind === PROBLEM_KIND.targetFull ? [`${p.unitId}:${p.unplaced}`] : [],
    );
    assert.deepEqual(full.sort(), ["b:2", "c:2"]);
  });

  it("reports a swap between two full units as blocked rather than looping", () => {
    const plan = computePlan({
      items: [item("x", "a", { name: "to-b" }), item("y", "b", { name: "to-a" })],
      units: [unit("a", CAP), unit("b", CAP)],
      rules: [rule("one", "b", nameHas("to-b")), rule("two", "a", nameHas("to-a"))],
    });
    assert.deepEqual(plan.steps, []);
    assert.deepEqual(plan.problems, [{ kind: PROBLEM_KIND.swapBlocked, unplaced: 2 }]);
    assert.equal(plan.ruleReports[0]?.unplaced, 1);
  });

  it("completes a swap when one unit has a free slot to start it", () => {
    const plan = computePlan({
      items: [item("x", "a", { name: "to-b" }), item("y", "b", { name: "to-a" })],
      units: [unit("a", CAP), unit("b", CAP - 1)],
      rules: [rule("one", "b", nameHas("to-b")), rule("two", "a", nameHas("to-a"))],
    });
    assert.equal(plan.itemsToMove, 2);
    assert.deepEqual(plan.problems, []);
    for (const step of plan.steps)
      assert.ok(step.itemIds.length <= STORAGE_LIMITS.maxItemsPerTransfer);
  });

  it("chunks a move larger than the per-transfer cap", () => {
    const total = STORAGE_LIMITS.maxItemsPerTransfer + 5;
    const plan = computePlan({
      items: many("c", INVENTORY_LOCATION_ID, total),
      units: [unit("a", 0), unit("b", 0)],
      rules: [rule("r", "a", category("Container"))],
    });
    // One unit holds at most CAP, so 1005 items can only be placed up to CAP.
    assert.equal(plan.itemsToMove, STORAGE_LIMITS.unitCapacity);
    assert.ok(plan.steps.every((s) => s.itemIds.length <= STORAGE_LIMITS.maxItemsPerTransfer));
    assert.equal(plan.problems[0]?.kind, PROBLEM_KIND.targetFull);
  });

  it("splits one pair into several steps when room opens up in stages", () => {
    const plan = computePlan({
      items: [...many("m", "a", 3, { name: "to-b" }), ...many("n", "b", 2, { name: "to-c" })],
      units: [unit("a", 3), unit("b", CAP - 1), unit("c", 0)],
      rules: [rule("one", "b", nameHas("to-b")), rule("two", "c", nameHas("to-c"))],
    });
    assert.equal(plan.itemsToMove, 5);
    assert.deepEqual(plan.problems, []);
    assert.equal(plan.steps.filter((s) => s.from === "a" && s.to === "b").length, 1);
    const firstIntoB = plan.steps.findIndex((s) => s.to === "b");
    const firstOutOfB = plan.steps.findIndex((s) => s.from === "b");
    assert.ok(firstOutOfB < firstIntoB, "b drains before a pushes into it");
  });

  it("returns the same plan for the same input", () => {
    const input = {
      items: [...many("a", INVENTORY_LOCATION_ID, 5), ...many("b", "u1", 5, { name: "other" })],
      units: [unit("u1", 5), unit("u2", CAP - 3)],
      rules: [rule("r1", "u2", category("Container")), rule("r2", "u1", nameHas("other"))],
    };
    assert.deepEqual(computePlan(input), computePlan(input));
  });

  it("returns an empty, non-executable plan when there are no rules", () => {
    const plan = computePlan({ items: [item("1", "inventory")], units: [unit("a", 0)], rules: [] });
    assert.deepEqual(plan.steps, []);
    assert.ok(!plan.executable);
  });
});

describe("schemas", () => {
  it("accepts a well-formed rule list and rejects empty conditions or unknown kinds", () => {
    const good = [rule("r", "u", category("Container"))];
    assert.ok(rulesSchema.safeParse(good).success);
    assert.ok(!rulesSchema.safeParse([{ id: "r", targetUnitId: "u", conditions: [] }]).success);
    assert.ok(
      !rulesSchema.safeParse([
        { id: "r", targetUnitId: "u", conditions: [{ kind: "colour", value: "red" }] },
      ]).success,
    );
    assert.ok(!rulesSchema.safeParse([rule("r", "u", category("   "))]).success);
  });

  it("validates plan requests", () => {
    assert.ok(
      planRequestSchema.safeParse({ steps: [{ from: "1", to: "2", itemIds: ["3"] }] }).success,
    );
    assert.ok(!planRequestSchema.safeParse({ steps: [] }).success);
    assert.ok(
      !planRequestSchema.safeParse({ steps: [{ from: "1", to: "2", itemIds: [] }] }).success,
    );
    assert.ok(!planRequestSchema.safeParse({}).success);
  });
});
