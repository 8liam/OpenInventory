/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import { useItemViewMode } from "~/lib/items/view-mode.store";
import { COPY } from "~/lib/copy/copy.config";
import { FALLBACK_SETTINGS } from "~/lib/settings/settings.parse";
import { useSettings } from "~/lib/settings/settings.store";
import { render, screen, setupUser } from "~test/ui";
import { SettingsItems } from "./settings-items.component";

const copy = COPY.settings.items;

beforeEach(() => {
  useSettings.setState({ ...FALLBACK_SETTINGS });
  useItemViewMode.setState({ mode: "list" });
});

test("the default view control follows and sets the view mode", async () => {
  render(<SettingsItems />);
  assert.equal(
    screen.getByRole("radio", { name: copy.views.list }).getAttribute("aria-checked"),
    "true",
  );
  await setupUser().click(screen.getByRole("radio", { name: copy.views.grid }));
  assert.equal(useItemViewMode.getState().mode, "grid");
});

test("the float threshold control saves the choice", async () => {
  render(<SettingsItems />);
  await setupUser().click(screen.getByRole("radio", { name: copy.floatOff }));
  assert.equal(useSettings.getState().floatThreshold, "off");
});

test("the default sort select lists the sorts and saves the pick", async () => {
  render(<SettingsItems />);
  const user = setupUser();
  await user.click(screen.getByRole("combobox", { name: copy.defaultSort }));
  const options = screen.getAllByRole("option");
  assert.ok(options.length > 1);
  const other = options.find((option) => option.getAttribute("aria-selected") === "false");
  assert.ok(other);
  await user.click(other);
  assert.notEqual(useSettings.getState().defaultSort, FALLBACK_SETTINGS.defaultSort);
});
