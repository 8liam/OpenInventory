/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import type { OrganiserRule } from "~/lib/organiser/organiser.types";
import { ORGANISER_LIMITS } from "~/lib/organiser/organiser.config";
import { render, screen, setupUser } from "~test/ui";
import { OrganiserRuleForm } from "./organiser-rule-form.component";
import { RULE_FORM } from "./organiser-rule-form.config";

const UNITS = [
  { id: "u1", name: "Unit A", itemCount: 0, loaded: true },
  { id: "u2", name: "Unit B", itemCount: 0, loaded: true },
];
const SUGGESTIONS = { category: ["Rifle"], rarity: [], collection: [], name: [] } as const;

function mount(onAdd: (rule: OrganiserRule) => void = () => {}) {
  return render(<OrganiserRuleForm units={UNITS} suggestions={SUGGESTIONS} onAdd={onAdd} />);
}

describe("OrganiserRuleForm", () => {
  test("is a labelled form with one blank condition", () => {
    mount();
    assert.ok(screen.getByRole("form", { name: RULE_FORM.heading }));
    assert.equal(screen.getAllByLabelText(RULE_FORM.valueLabel).length, 1);
  });

  test("submitting an incomplete rule adds nothing and shows the hint", async () => {
    const added: OrganiserRule[] = [];
    mount((rule) => added.push(rule));
    await setupUser().click(screen.getByRole("button", { name: RULE_FORM.addRule }));
    assert.deepEqual(added, []);
    assert.equal(screen.getByRole("alert").textContent, RULE_FORM.invalid);
  });

  test("a complete rule is added with a trimmed value and the chosen unit, then the form resets", async () => {
    const added: OrganiserRule[] = [];
    mount((rule) => added.push(rule));
    const user = setupUser();
    await user.type(screen.getByLabelText(RULE_FORM.valueLabel), "  Rifle ");
    await user.click(screen.getByRole("combobox", { name: RULE_FORM.targetLabel }));
    await user.click(screen.getByRole("option", { name: "Unit B" }));
    await user.click(screen.getByRole("button", { name: RULE_FORM.addRule }));
    assert.equal(added.length, 1);
    assert.equal(added[0]?.targetUnitId, "u2");
    assert.deepEqual(added[0]?.conditions, [{ kind: "category", value: "Rifle" }]);
    assert.equal((screen.getByLabelText(RULE_FORM.valueLabel) as HTMLInputElement).value, "");
  });

  test("conditions can be added and removed", async () => {
    mount();
    const user = setupUser();
    await user.click(screen.getByRole("button", { name: RULE_FORM.addCondition }));
    assert.equal(screen.getAllByLabelText(RULE_FORM.valueLabel).length, 2);
    await user.click(screen.getAllByRole("button", { name: RULE_FORM.removeCondition })[0] as HTMLElement);
    assert.equal(screen.getAllByLabelText(RULE_FORM.valueLabel).length, 1);
  });

  test("Add condition stops at the per-rule limit", async () => {
    mount();
    const user = setupUser();
    for (let i = 1; i < ORGANISER_LIMITS.maxConditionsPerRule; i += 1) {
      await user.click(screen.getByRole("button", { name: RULE_FORM.addCondition }));
    }
    assert.equal((screen.getByRole("button", { name: RULE_FORM.addCondition }) as HTMLButtonElement).disabled, true);
  });
});
