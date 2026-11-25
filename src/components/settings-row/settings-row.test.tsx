/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { render, screen } from "~test/ui";
import { SettingsRow } from "./settings-row.component";

test("SettingsRow shows label, description, detail and its control", () => {
  render(
    <SettingsRow label="Currency" labelId="cur" description="Pick one" detail={<p>extra</p>}>
      <button type="button">Control</button>
    </SettingsRow>,
  );
  assert.equal(screen.getByText("Currency").id, "cur");
  assert.ok(screen.getByText("Pick one"));
  assert.ok(screen.getByText("extra"));
  assert.ok(screen.getByRole("button", { name: "Control" }));
});

test("SettingsRow works without a control or description", () => {
  render(<SettingsRow label="Only label" stacked />);
  assert.ok(screen.getByText("Only label"));
  assert.ok(screen.queryByRole("button") === null);
});
