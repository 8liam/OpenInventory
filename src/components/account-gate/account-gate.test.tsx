/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, test } from "node:test";
import { useAccountSelection } from "~/lib/accounts/account-scope.store";
import { ALL_ACCOUNTS } from "~/lib/accounts/accounts.config";
import { COPY } from "~/lib/copy/copy.config";
import { AUTH_STATUS, STORAGE_API } from "~/lib/storage/storage.config";
import {
  accountState,
  appSnapshot,
  installFakeApi,
  STEAM_ID_A,
  STEAM_ID_B,
  storageSnapshot,
  type FakeApi,
} from "~test/fake-api";
import { renderWithRouter } from "~test/router";
import { screen, setupUser, waitFor } from "~test/ui";
import { AccountGate } from "./account-gate.component";

const copy = COPY.accounts;
const READY = accountState(STEAM_ID_A, { displayName: "Alpha" });
const READY_B = accountState(STEAM_ID_B, { displayName: "Bravo" });
const BROKEN_B = accountState(STEAM_ID_B, {
  displayName: "Bravo",
  snapshot: storageSnapshot({ auth: { status: AUTH_STATUS.error, message: "Login failed" } }),
});

describe("AccountGate", () => {
  let api: FakeApi;
  beforeEach(() => {
    api = installFakeApi();
    useAccountSelection.setState({ selected: undefined });
  });
  afterEach(() => api.restore());

  function mount(pathname: string) {
    return renderWithRouter(
      <AccountGate pathname={pathname}>
        <p>page</p>
      </AccountGate>,
    );
  }

  test("a connected account sees the page, with no notice", async () => {
    await mount("/storage");
    await api.push(appSnapshot([READY]));
    assert.ok(screen.getByText("page"));
    assert.equal(screen.getByRole("status").textContent, "");
  });

  test("in the all view, a one-account page asks which account", async () => {
    useAccountSelection.setState({ selected: ALL_ACCOUNTS });
    await mount("/storage");
    await api.push(appSnapshot([READY, READY_B]));
    assert.ok(screen.getByRole("heading", { name: copy.chooseOneTitle }));
    assert.ok(screen.getByText(copy.chooseOneBody["/storage"] ?? ""));
    assert.ok(screen.queryByText("page") === null);
  });

  test("choosing an account in that prompt selects it and shows the page", async () => {
    useAccountSelection.setState({ selected: ALL_ACCOUNTS });
    await mount("/storage");
    await api.push(appSnapshot([READY, READY_B]));
    await setupUser().click(screen.getByRole("button", { name: /Bravo/ }));
    assert.equal(useAccountSelection.getState().selected, STEAM_ID_B);
    assert.ok(await screen.findByText("page"));
  });

  test("pages that can show every account skip the prompt", async () => {
    useAccountSelection.setState({ selected: ALL_ACCOUNTS });
    await mount("/items");
    await api.push(appSnapshot([READY, READY_B]));
    assert.ok(screen.getByText("page"));
  });

  test("settings is never gated, even for a broken account", async () => {
    useAccountSelection.setState({ selected: STEAM_ID_B });
    await mount("/settings");
    await api.push(appSnapshot([READY, BROKEN_B]));
    assert.ok(screen.getByText("page"));
  });

  test("a broken account shows its status instead of the page", async () => {
    useAccountSelection.setState({ selected: STEAM_ID_B });
    await mount("/storage");
    await api.push(appSnapshot([READY, BROKEN_B]));
    assert.ok(screen.queryByText("page") === null);
    assert.equal(screen.getByRole("alert").textContent, "Login failed");
  });

  test("in the all view a broken account leaves a notice but keeps the page", async () => {
    useAccountSelection.setState({ selected: ALL_ACCOUNTS });
    await mount("/items");
    await api.push(appSnapshot([READY, BROKEN_B]));
    assert.ok(screen.getByText("page"));
    assert.equal(screen.getAllByRole("status")[0]?.textContent, copy.partialNotice(["Bravo"]));
    assert.ok(screen.getByRole("link", { name: copy.partialSettings }));
    assert.ok(screen.getByRole("button", { name: copy.reconnect }));
  });

  test("an idle account is asked to connect once", async () => {
    const idle = accountState(STEAM_ID_A, { snapshot: storageSnapshot({ auth: { status: AUTH_STATUS.idle } }) });
    await mount("/storage");
    await api.push(appSnapshot([idle]));
    await waitFor(() => assert.equal(api.calls.length, 1));
    assert.deepEqual(api.calls[0], {
      path: STORAGE_API.accountConnect,
      method: "POST",
      body: { accountId: STEAM_ID_A },
    });
    await api.push({ ...appSnapshot([idle]), revision: 2 });
    assert.equal(api.calls.length, 1);
  });
});
