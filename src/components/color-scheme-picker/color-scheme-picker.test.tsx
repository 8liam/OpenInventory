/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { PALETTE_LIST } from "~/lib/theme/palettes.config";
import { COLOR_SCHEMES } from "~/lib/theme/theme.config";
import { render, screen, setupUser } from "~test/ui";
import { ColorSchemePicker } from "./color-scheme-picker.component";

const LABELS = { system: "System", light: "Light", dark: "Dark" } as const;
const PALETTE = PALETTE_LIST[0];
if (!PALETTE) throw new Error("no palette");

test("ColorSchemePicker offers every scheme as a radio, the value checked", () => {
  render(
    <ColorSchemePicker ariaLabel="Colour scheme" value="dark" palette={PALETTE} labels={LABELS} onChange={() => {}} />,
  );
  assert.ok(screen.getByRole("radiogroup", { name: "Colour scheme" }));
  assert.equal(screen.getAllByRole("radio").length, COLOR_SCHEMES.length);
  assert.equal(screen.getByRole("radio", { name: "Dark" }).getAttribute("aria-checked"), "true");
  assert.equal(screen.getByRole("radio", { name: "Light" }).getAttribute("aria-checked"), "false");
});

test("ColorSchemePicker reports the clicked scheme", async () => {
  const picked: string[] = [];
  render(
    <ColorSchemePicker ariaLabel="Scheme" value="system" palette={PALETTE} labels={LABELS} onChange={(s) => picked.push(s)} />,
  );
  await setupUser().click(screen.getByRole("radio", { name: "Light" }));
  assert.deepEqual(picked, ["light"]);
});
