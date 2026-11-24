/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import { COPY } from "~/lib/copy/copy.config";
import { FALLBACK_SETTINGS } from "~/lib/settings/settings.parse";
import { useSettings } from "~/lib/settings/settings.store";
import { render, screen, setupUser } from "~test/ui";
import { SettingsPricing } from "./settings-pricing.component";

const copy = COPY.settings.pricing;

beforeEach(() => {
  useSettings.setState({ ...FALLBACK_SETTINGS });
});

test("SettingsPricing shows the stored currency and marketplace", () => {
  render(<SettingsPricing />);
  assert.ok(
    screen
      .getByRole("combobox", { name: copy.currency })
      .textContent?.includes(FALLBACK_SETTINGS.currency),
  );
  assert.ok(screen.getByRole("combobox", { name: copy.marketplace }));
});

test("choosing a currency updates the settings", async () => {
  render(<SettingsPricing />);
  const user = setupUser();
  await user.click(screen.getByRole("combobox", { name: copy.currency }));
  await user.click(screen.getByRole("option", { name: "EUR" }));
  assert.equal(useSettings.getState().currency, "EUR");
});

test("choosing a marketplace updates the settings", async () => {
  render(<SettingsPricing />);
  const user = setupUser();
  await user.click(screen.getByRole("combobox", { name: copy.marketplace }));
  const [, second] = screen.getAllByRole("option");
  assert.ok(second);
  await user.click(second);
  assert.notEqual(useSettings.getState().marketplace, FALLBACK_SETTINGS.marketplace);
});
