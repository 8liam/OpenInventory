/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, test } from "node:test";
import { useAddAccountDialog } from "~/lib/accounts/add-account-dialog.store";
import { COPY } from "~/lib/copy/copy.config";
import { AUTH_STATUS, STORAGE_API } from "~/lib/storage/storage.config";
import type { AppSnapshot } from "~/lib/storage/storage.types";
import { accountState, appSnapshot, installFakeApi, STEAM_ID_A, STEAM_ID_B, type FakeApi } from "~test/fake-api";
import { act, render, screen, setupUser, waitFor } from "~test/ui";
import { AddAccountDialog } from "./add-account-dialog.component";

const copy = COPY.accounts;

function withLogin(snapshot: AppSnapshot, patch: Partial<AppSnapshot>): AppSnapshot {
  return { ...snapshot, ...patch };
}

describe("AddAccountDialog", () => {
  let api: FakeApi;
  beforeEach(() => {
    api = installFakeApi();
    useAddAccountDialog.setState({ open: false, target: undefined, outcome: undefined });
  });
  afterEach(() => api.restore());

  test("stays closed until opened", async () => {
    render(<AddAccountDialog />);
    await api.push(appSnapshot([accountState(STEAM_ID_A)]));
    assert.ok(screen.queryByRole("dialog") === null);
  });

  test("opening for a new account shows the add title and a way to start", async () => {
    render(<AddAccountDialog />);
    await api.push(appSnapshot([accountState(STEAM_ID_A)]));
    await act(async () => useAddAccountDialog.getState().openAdd());
    assert.ok(screen.getByRole("dialog", { name: copy.addTitle }));
    assert.ok(screen.getByRole("button", { name: COPY.signIn.button }));
  });

  test("re-auth names the account being signed in again", async () => {
    render(<AddAccountDialog />);
    await api.push(appSnapshot([accountState(STEAM_ID_A, { displayName: "Alpha" })]));
    await act(async () => useAddAccountDialog.getState().openReauth(STEAM_ID_A));
    assert.ok(screen.getByRole("dialog", { name: copy.reauthTitle("Alpha") }));
  });

  test("Cancel closes the dialog", async () => {
    render(<AddAccountDialog />);
    await api.push(appSnapshot([accountState(STEAM_ID_A)]));
    await act(async () => useAddAccountDialog.getState().openAdd());
    await setupUser().click(screen.getByRole("button", { name: copy.cancel }));
    await waitFor(() => assert.equal(useAddAccountDialog.getState().open, false));
  });

  test("cancelling mid sign-in also abandons the login on the server", async () => {
    render(<AddAccountDialog />);
    const base = appSnapshot([accountState(STEAM_ID_A)]);
    await api.push(withLogin(base, { login: { status: AUTH_STATUS.qrPending, qrSvg: "<svg></svg>" } }));
    await act(async () => useAddAccountDialog.getState().openAdd());
    await setupUser().click(screen.getByRole("button", { name: copy.cancel }));
    await waitFor(() => assert.ok(api.calls.some((call) => call.path === STORAGE_API.accountLoginCancel)));
  });

  test("a finished sign-in closes the dialog and records the outcome", async () => {
    render(<AddAccountDialog />);
    const base = appSnapshot([accountState(STEAM_ID_A)]);
    await api.push(base);
    await act(async () => useAddAccountDialog.getState().openAdd());
    await api.push(
      withLogin(base, {
        accounts: [accountState(STEAM_ID_A), accountState(STEAM_ID_B)],
        lastLogin: { sequence: 1, steamId: STEAM_ID_B, added: true },
      }),
    );
    const state = useAddAccountDialog.getState();
    assert.equal(state.open, false);
    assert.deepEqual(state.outcome, { steamId: STEAM_ID_B, added: true, target: undefined });
  });
});
