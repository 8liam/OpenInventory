/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, test } from "node:test";
import { useAddAccountDialog } from "~/lib/accounts/add-account-dialog.store";
import { COPY } from "~/lib/copy/copy.config";
import { accountState, appSnapshot, installFakeApi, STEAM_ID_A, STEAM_ID_B, type FakeApi } from "~test/fake-api";
import { render, screen, setupUser } from "~test/ui";
import { AccountsPanel } from "./accounts-panel.component";

const copy = COPY.accounts;

describe("AccountsPanel", () => {
  let api: FakeApi;
  beforeEach(() => {
    api = installFakeApi();
    useAddAccountDialog.setState({ open: false });
  });
  afterEach(() => api.restore());

  test("lists every tracked account", async () => {
    render(<AccountsPanel />);
    await api.push(
      appSnapshot([
        accountState(STEAM_ID_A, { displayName: "Alpha" }),
        accountState(STEAM_ID_B, { displayName: "Bravo" }),
      ]),
    );
    assert.ok(screen.getByRole("heading", { name: copy.settingsTitle }));
    assert.equal(screen.getAllByRole("listitem").length, 2);
    assert.ok(screen.getByRole("button", { name: copy.removeAria("Alpha") }));
    assert.ok(screen.getByRole("button", { name: copy.removeAria("Bravo") }));
  });

  test("Add account opens the sign-in dialog", async () => {
    render(<AccountsPanel />);
    await api.push(appSnapshot([accountState(STEAM_ID_A)]));
    await setupUser().click(screen.getByRole("button", { name: copy.add }));
    assert.equal(useAddAccountDialog.getState().open, true);
  });
});
