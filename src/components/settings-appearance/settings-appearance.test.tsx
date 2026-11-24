/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import { COPY } from "~/lib/copy/copy.config";
import { FALLBACK_SETTINGS } from "~/lib/settings/settings.parse";
import { useSettings } from "~/lib/settings/settings.store";
import { PALETTE_LIST } from "~/lib/theme/palettes.config";
import { render, screen, setupUser } from "~test/ui";
import { SettingsAppearance } from "./settings-appearance.component";

const copy = COPY.settings.appearance;

beforeEach(() => {
  useSettings.setState({ ...FALLBACK_SETTINGS });
});

test("choosing a colour scheme saves it", async () => {
  render(<SettingsAppearance />);
  await setupUser().click(screen.getByRole("radio", { name: copy.colorSchemes.dark }));
  assert.equal(useSettings.getState().colorScheme, "dark");
});

test("choosing a palette saves it", async () => {
  render(<SettingsAppearance />);
  const other = PALETTE_LIST.find((palette) => palette.id !== FALLBACK_SETTINGS.palette);
  assert.ok(other);
  await setupUser().click(screen.getByRole("radio", { name: other.name }));
  assert.equal(useSettings.getState().palette, other.id);
});

test("shows both pickers under their headings", () => {
  render(<SettingsAppearance />);
  assert.ok(screen.getByRole("radiogroup", { name: copy.colorScheme }));
  assert.ok(screen.getByRole("radiogroup", { name: copy.palette }));
});
