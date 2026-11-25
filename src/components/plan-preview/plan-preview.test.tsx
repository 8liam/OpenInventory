/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { computePlan } from "~/lib/organiser/organiser.plan";
import type { OrganiserRule } from "~/lib/organiser/organiser.types";
import { makeItem } from "~test/fixtures";
import { render, screen } from "~test/ui";
import { PlanPreview } from "./plan-preview.component";
import { PLAN_PREVIEW } from "./plan-preview.config";

const UNITS = [{ id: "u1", name: "Unit A", itemCount: 0, loaded: true }];
const NAMES = new Map(UNITS.map((unit) => [unit.id, unit.name]));
const RULE: OrganiserRule = {
  id: "r1",
  targetUnitId: "u1",
  conditions: [{ kind: "category", value: "Rifle" }],
};

function plan(
  items = [makeItem({ id: "a", category: "Rifle" })],
  rules: readonly OrganiserRule[] = [RULE],
) {
  return computePlan({ items, units: UNITS, rules });
}

describe("PlanPreview", () => {
  test("is a labelled section; with no rules it asks for one", () => {
    render(<PlanPreview plan={plan([], [])} rules={[]} unitNames={NAMES} />);
    assert.ok(screen.getByRole("region", { name: PLAN_PREVIEW.heading }));
    assert.ok(screen.getByText(PLAN_PREVIEW.noRules));
  });

  test("a rule that matches shows the summary, the move and the unit's new count", () => {
    render(<PlanPreview plan={plan()} rules={[RULE]} unitNames={NAMES} />);
    assert.ok(screen.getByText(PLAN_PREVIEW.step(1, "Inventory", "Unit A")));
    assert.ok(screen.getByText(PLAN_PREVIEW.unitLine("Unit A", 0, 1, 1000)));
  });

  test("a rule that matches nothing says so", () => {
    const items = [makeItem({ id: "a", category: "Pistol" })];
    render(<PlanPreview plan={plan(items)} rules={[RULE]} unitNames={NAMES} />);
    assert.ok(screen.getByText(PLAN_PREVIEW.noMatches));
  });

  test("items already in place need no moves", () => {
    const items = [makeItem({ id: "a", category: "Rifle", locationId: "u1" })];
    render(<PlanPreview plan={plan(items)} rules={[RULE]} unitNames={NAMES} />);
    assert.ok(screen.getByText(PLAN_PREVIEW.nothingToMove));
  });

  test("a rule aiming at a missing unit reports a problem alert", () => {
    const bad: OrganiserRule = { ...RULE, targetUnitId: "gone" };
    render(<PlanPreview plan={plan(undefined, [bad])} rules={[bad]} unitNames={NAMES} />);
    assert.ok(screen.getByRole("alert"));
  });
});
