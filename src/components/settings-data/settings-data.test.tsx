/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, test } from "node:test";
import { COPY } from "~/lib/copy/copy.config";
import { FALLBACK_SETTINGS } from "~/lib/settings/settings.parse";
import { useSettings } from "~/lib/settings/settings.store";
import { STORAGE_API } from "~/lib/storage/storage.config";
import { accountState, appSnapshot, installFakeApi, STEAM_ID_A, type FakeApi } from "~test/fake-api";
import { render, screen, setupUser, waitFor } from "~test/ui";
import { SettingsData } from "./settings-data.component";

const copy = COPY.settings.data;

describe("SettingsData", () => {
  let api: FakeApi;
  beforeEach(() => {
    api = installFakeApi();
    useSettings.setState({ ...FALLBACK_SETTINGS });
  });
  afterEach(() => api.restore());

  test("Refresh posts a refresh for every connected account in view", async () => {
    render(<SettingsData />);
    await api.push(appSnapshot([accountState(STEAM_ID_A)]));
    await setupUser().click(screen.getByRole("button", { name: copy.refreshData }));
    await waitFor(() => assert.equal(api.calls.length, 1));
    assert.ok(api.calls[0]?.path.startsWith(STORAGE_API.refresh));
    assert.deepEqual(api.calls[0]?.body, { accountId: STEAM_ID_A });
  });

  test("a failed refresh is shown as an alert", async () => {
    api.respond(STORAGE_API.refresh, () => ({ status: 500, body: { error: "steam down" } }));
    render(<SettingsData />);
    await api.push(appSnapshot([accountState(STEAM_ID_A)]));
    await setupUser().click(screen.getByRole("button", { name: copy.refreshData }));
    assert.ok((await screen.findByRole("alert")).textContent?.includes("steam down"));
  });

  test("Reset asks first, then restores the default preferences", async () => {
    useSettings.setState({ currency: "EUR" });
    render(<SettingsData />);
    await api.push(appSnapshot([accountState(STEAM_ID_A)]));
    const user = setupUser();
    await user.click(screen.getByRole("button", { name: copy.resetButton }));
    assert.equal(useSettings.getState().currency, "EUR");
    await user.click(screen.getByRole("checkbox", { name: copy.resetCheckbox }));
    await user.click(screen.getByRole("button", { name: copy.resetConfirm }));
    await waitFor(() => assert.equal(useSettings.getState().currency, FALLBACK_SETTINGS.currency));
  });
});
