/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { render, screen } from "~test/ui";
import { SettingsSection } from "./settings-section.component";

test("SettingsSection is a region named by its h2, with description, action and rows", () => {
  render(
    <SettingsSection
      title="Pricing"
      description="How prices show"
      action={<button type="button">Add</button>}
    >
      <p>row</p>
    </SettingsSection>,
  );
  assert.ok(screen.getByRole("region", { name: "Pricing" }));
  assert.ok(screen.getByRole("heading", { level: 2, name: "Pricing" }));
  assert.ok(screen.getByText("How prices show"));
  assert.ok(screen.getByRole("button", { name: "Add" }));
  assert.ok(screen.getByText("row"));
});

test("plain sections still render their children", () => {
  render(
    <SettingsSection title="Cards" plain>
      <p>cards here</p>
    </SettingsSection>,
  );
  assert.ok(screen.getByText("cards here"));
});
