/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, test } from "node:test";
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
import { act, render, screen, setupUser } from "~test/ui";
import { LoginOutcome } from "./login-outcome.component";

const copy = COPY.accounts.outcome;

describe("LoginOutcome", () => {
  let api: FakeApi;
  beforeEach(() => {
    api = installFakeApi();
    useAccountSelection.setState({ selected: STEAM_ID_A });
    useAddAccountDialog.setState({ outcome: undefined });
  });
  afterEach(() => api.restore());

  async function mount() {
    render(<LoginOutcome />);
    await api.push(
      appSnapshot([
        accountState(STEAM_ID_A, { displayName: "Alpha" }),
        accountState(STEAM_ID_B, { displayName: "Bravo" }),
      ]),
    );
  }

  test("is silent without an outcome", async () => {
    await mount();
    assert.ok(screen.queryByRole("group") === null);
    assert.equal(screen.getByRole("status").textContent, "");
  });

  test("announces an added account", async () => {
    await mount();
    await act(async () =>
      useAddAccountDialog.setState({
        outcome: { steamId: STEAM_ID_B, added: true, target: undefined },
      }),
    );
    assert.equal((await screen.findByRole("status")).textContent, copy.added("Bravo"));
    assert.ok(screen.getByRole("group", { name: copy.added("Bravo") }));
  });

  test("announces a re-signed-in account", async () => {
    await mount();
    await act(async () =>
      useAddAccountDialog.setState({
        outcome: { steamId: STEAM_ID_A, added: false, target: STEAM_ID_A },
      }),
    );
    assert.equal((await screen.findByRole("status")).textContent, copy.reconnected("Alpha"));
  });

  test("warns when a different account signed in than the one being fixed", async () => {
    await mount();
    await act(async () =>
      useAddAccountDialog.setState({
        outcome: { steamId: STEAM_ID_B, added: false, target: STEAM_ID_A },
      }),
    );
    assert.equal(
      (await screen.findByRole("status")).textContent,
      copy.otherAccount("Bravo", "Alpha"),
    );
  });

  test("View switches to that account and clears the outcome", async () => {
    await mount();
    await act(async () =>
      useAddAccountDialog.setState({
        outcome: { steamId: STEAM_ID_B, added: true, target: undefined },
      }),
    );
    await setupUser().click(await screen.findByRole("button", { name: copy.switchTo("Bravo") }));
    assert.equal(useAccountSelection.getState().selected, STEAM_ID_B);
    assert.equal(useAddAccountDialog.getState().outcome, undefined);
  });

  test("no View button when that account is already shown; Dismiss clears", async () => {
    await mount();
    await act(async () =>
      useAddAccountDialog.setState({
        outcome: { steamId: STEAM_ID_A, added: false, target: STEAM_ID_A },
      }),
    );
    assert.ok(screen.queryByRole("button", { name: copy.switchTo("Alpha") }) === null);
    await setupUser().click(await screen.findByRole("button", { name: copy.dismiss }));
    assert.equal(useAddAccountDialog.getState().outcome, undefined);
  });
});
