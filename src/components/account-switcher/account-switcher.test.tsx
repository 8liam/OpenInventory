/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, test } from "node:test";
import { ALL_ACCOUNTS } from "~/lib/accounts/accounts.config";
import { useAccountSelection } from "~/lib/accounts/account-scope.store";
import { useAddAccountDialog } from "~/lib/accounts/add-account-dialog.store";
import { COPY } from "~/lib/copy/copy.config";
import {
  accountState,
  appSnapshot,
  installFakeApi,
  STEAM_ID_A,
  STEAM_ID_B,
  type FakeApi,
} from "~test/fake-api";
import { render, screen, setupUser } from "~test/ui";
import { AccountSwitcher } from "./account-switcher.component";

const copy = COPY.accounts;

describe("AccountSwitcher", () => {
  let api: FakeApi;
  beforeEach(() => {
    api = installFakeApi();
    useAccountSelection.setState({ selected: undefined });
    useAddAccountDialog.setState({ open: false, target: undefined });
  });
  afterEach(() => api.restore());

  test("renders nothing before any account exists", async () => {
    const { container } = render(<AccountSwitcher />);
    await api.push(appSnapshot([]));
    assert.equal(container.textContent, "");
  });

  test("with one account it offers only an Add account button", async () => {
    render(<AccountSwitcher />);
    await api.push(appSnapshot([accountState(STEAM_ID_A)]));
    assert.ok(screen.getByText("Alpha"));
    assert.ok(screen.queryByRole("combobox") === null);
    await setupUser().click(screen.getByRole("button", { name: copy.add }));
    assert.equal(useAddAccountDialog.getState().open, true);
  });

  test("with several accounts it lists All, each account and Add", async () => {
    render(<AccountSwitcher />);
    await api.push(
      appSnapshot([
        accountState(STEAM_ID_A, { displayName: "Alpha" }),
        accountState(STEAM_ID_B, { displayName: "Bravo" }),
      ]),
    );
    const user = setupUser();
    await user.click(screen.getByRole("combobox", { name: copy.switcherLabel }));
    const names = screen.getAllByRole("option").map((option) => option.textContent ?? "");
    assert.ok(names.some((text) => text.includes(copy.all)));
    assert.ok(names.some((text) => text.includes("Alpha")));
    assert.ok(names.some((text) => text.includes("Bravo")));
    assert.ok(names.some((text) => text.includes(copy.add)));
  });

  test("picking an account selects it", async () => {
    render(<AccountSwitcher />);
    await api.push(
      appSnapshot([
        accountState(STEAM_ID_A, { displayName: "Alpha" }),
        accountState(STEAM_ID_B, { displayName: "Bravo" }),
      ]),
    );
    const user = setupUser();
    await user.click(screen.getByRole("combobox", { name: copy.switcherLabel }));
    await user.click(screen.getByRole("option", { name: /Bravo/ }));
    assert.equal(useAccountSelection.getState().selected, STEAM_ID_B);
  });

  test("picking All selects every account", async () => {
    useAccountSelection.setState({ selected: STEAM_ID_A });
    render(<AccountSwitcher />);
    await api.push(
      appSnapshot([accountState(STEAM_ID_A), accountState(STEAM_ID_B, { displayName: "Bravo" })]),
    );
    const user = setupUser();
    await user.click(screen.getByRole("combobox", { name: copy.switcherLabel }));
    await user.click(screen.getByRole("option", { name: new RegExp(copy.all) }));
    assert.equal(useAccountSelection.getState().selected, ALL_ACCOUNTS);
  });

  test("the Add account entry opens the dialog and keeps the selection", async () => {
    useAccountSelection.setState({ selected: STEAM_ID_A });
    render(<AccountSwitcher />);
    await api.push(
      appSnapshot([accountState(STEAM_ID_A), accountState(STEAM_ID_B, { displayName: "Bravo" })]),
    );
    const user = setupUser();
    await user.click(screen.getByRole("combobox", { name: copy.switcherLabel }));
    await user.click(screen.getByRole("option", { name: new RegExp(copy.add) }));
    assert.equal(useAddAccountDialog.getState().open, true);
    assert.equal(useAccountSelection.getState().selected, STEAM_ID_A);
  });
});
