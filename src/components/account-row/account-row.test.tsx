/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, test } from "node:test";
import { authStatusText } from "~/lib/accounts/account-status";
import { COPY } from "~/lib/copy/copy.config";
import { AUTH_STATUS, STORAGE_API } from "~/lib/storage/storage.config";
import { accountState, installFakeApi, STEAM_ID_A, storageSnapshot, type FakeApi } from "~test/fake-api";
import { render, screen, setupUser, waitFor } from "~test/ui";
import { AccountRow } from "./account-row.component";

const copy = COPY.accounts;

describe("AccountRow", () => {
  let api: FakeApi;
  beforeEach(() => {
    api = installFakeApi();
  });
  afterEach(() => api.restore());

  test("shows the account name and its connection status", () => {
    render(<AccountRow account={accountState(STEAM_ID_A)} onRemoved={() => {}} />);
    assert.ok(screen.getByText("Alpha"));
    assert.ok(screen.getByText(authStatusText(AUTH_STATUS.ready)));
  });

  test("choosing a label saves it for the account", async () => {
    render(<AccountRow account={accountState(STEAM_ID_A)} onRemoved={() => {}} />);
    const user = setupUser();
    await user.click(screen.getByRole("combobox", { name: copy.labelAria("Alpha") }));
    await user.click(screen.getByRole("option", { name: copy.labels.trade }));
    await waitFor(() => assert.equal(api.calls.length, 1));
    assert.deepEqual(api.calls[0], {
      path: STORAGE_API.accountLabel,
      method: "POST",
      body: { accountId: STEAM_ID_A, label: "trade" },
    });
  });

  test("choosing No label clears it", async () => {
    render(<AccountRow account={accountState(STEAM_ID_A, { label: "main" })} onRemoved={() => {}} />);
    const user = setupUser();
    await user.click(screen.getByRole("combobox", { name: copy.labelAria("Alpha") }));
    await user.click(screen.getByRole("option", { name: copy.unlabelled }));
    await waitFor(() => assert.equal(api.calls.length, 1));
    assert.deepEqual(api.calls[0]?.body, { accountId: STEAM_ID_A, label: null });
  });

  test("a failed label save is announced as an alert", async () => {
    api.respond(STORAGE_API.accountLabel, () => ({ status: 400, body: { error: "bad label" } }));
    render(<AccountRow account={accountState(STEAM_ID_A)} onRemoved={() => {}} />);
    const user = setupUser();
    await user.click(screen.getByRole("combobox", { name: copy.labelAria("Alpha") }));
    await user.click(screen.getByRole("option", { name: copy.labels.alt }));
    assert.equal((await screen.findByRole("alert")).textContent, "bad label");
  });

  test("an errored account shows its message and recovery actions", () => {
    const account = accountState(STEAM_ID_A, {
      snapshot: storageSnapshot({ auth: { status: AUTH_STATUS.error, message: "Login failed" } }),
    });
    render(<AccountRow account={account} onRemoved={() => {}} />);
    assert.ok(screen.getByText("Login failed"));
    assert.ok(screen.getByRole("button", { name: copy.reconnect }));
  });

  test("a healthy account has no recovery actions", () => {
    render(<AccountRow account={accountState(STEAM_ID_A)} onRemoved={() => {}} />);
    assert.ok(screen.queryByRole("button", { name: copy.reconnect }) === null);
  });

  test("Remove asks for confirmation, then posts and reports onRemoved", async () => {
    let removed = 0;
    render(<AccountRow account={accountState(STEAM_ID_A)} onRemoved={() => void (removed += 1)} />);
    const user = setupUser();
    await user.click(screen.getByRole("button", { name: copy.removeAria("Alpha") }));
    assert.ok(screen.getByRole("dialog", { name: copy.removeTitle("Alpha") }));
    assert.equal(api.calls.length, 0);
    await user.click(screen.getByRole("checkbox", { name: copy.removeCheckbox }));
    await user.click(screen.getByRole("button", { name: copy.removeConfirm }));
    await waitFor(() => assert.equal(removed, 1));
    assert.deepEqual(api.calls[0], {
      path: STORAGE_API.accountRemove,
      method: "POST",
      body: { accountId: STEAM_ID_A },
    });
  });

  test("cancelling the removal sends nothing", async () => {
    render(<AccountRow account={accountState(STEAM_ID_A)} onRemoved={() => {}} />);
    const user = setupUser();
    await user.click(screen.getByRole("button", { name: copy.removeAria("Alpha") }));
    await user.click(screen.getByRole("button", { name: copy.cancel }));
    assert.equal(api.calls.length, 0);
  });
});
