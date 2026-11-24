/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { PALETTE_LIST } from "~/lib/theme/palettes.config";
import { render, screen, setupUser } from "~test/ui";
import { ThemePicker } from "./theme-picker.component";

const FIRST = PALETTE_LIST[0];
const SECOND = PALETTE_LIST[1];
if (!FIRST || !SECOND) throw new Error("need two palettes");

test("ThemePicker lists every palette by name with the value checked", () => {
  render(<ThemePicker ariaLabel="Theme" scheme="dark" value={FIRST.id} onChange={() => {}} />);
  assert.ok(screen.getByRole("radiogroup", { name: "Theme" }));
  assert.equal(screen.getAllByRole("radio").length, PALETTE_LIST.length);
  assert.equal(screen.getByRole("radio", { name: FIRST.name }).getAttribute("aria-checked"), "true");
  assert.equal(screen.getByRole("radio", { name: SECOND.name }).getAttribute("aria-checked"), "false");
});

test("ThemePicker reports the chosen palette id", async () => {
  const picked: string[] = [];
  render(<ThemePicker ariaLabel="Theme" scheme="light" value={FIRST.id} onChange={(id) => picked.push(id)} />);
  await setupUser().click(screen.getByRole("radio", { name: SECOND.name }));
  assert.deepEqual(picked, [SECOND.id]);
});
