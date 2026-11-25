/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, test } from "node:test";
import { COPY } from "~/lib/copy/copy.config";
import { useAddAccountDialog } from "~/lib/accounts/add-account-dialog.store";
import { STORAGE_API } from "~/lib/storage/storage.config";
import { installFakeApi, STEAM_ID_A, type FakeApi } from "~test/fake-api";
import { render, screen, setupUser, waitFor } from "~test/ui";
import { AccountActions } from "./account-actions.component";

const copy = COPY.accounts;

describe("AccountActions", () => {
  let api: FakeApi;
  beforeEach(() => {
    api = installFakeApi();
    useAddAccountDialog.setState({ open: false, target: undefined });
  });
  afterEach(() => api.restore());

  test("Reconnect posts the account id", async () => {
    render(<AccountActions steamId={STEAM_ID_A} />);
    await setupUser().click(screen.getByRole("button", { name: copy.reconnect }));
    await waitFor(() => assert.equal(api.calls.length, 1));
    assert.deepEqual(api.calls[0], {
      path: STORAGE_API.accountReconnect,
      method: "POST",
      body: { accountId: STEAM_ID_A },
    });
  });

  test("a failed reconnect shows the server message as an alert", async () => {
    api.respond(STORAGE_API.accountReconnect, () => ({ status: 500, body: { error: "boom" } }));
    render(<AccountActions steamId={STEAM_ID_A} />);
    await setupUser().click(screen.getByRole("button", { name: copy.reconnect }));
    assert.equal((await screen.findByRole("alert")).textContent, "boom");
  });

  test("Sign in again opens the re-auth dialog for the account", async () => {
    render(<AccountActions steamId={STEAM_ID_A} />);
    await setupUser().click(screen.getByRole("button", { name: copy.signInAgain }));
    const state = useAddAccountDialog.getState();
    assert.equal(state.open, true);
    assert.equal(state.target, STEAM_ID_A);
  });

  test("a second click while reconnecting sends nothing more", async () => {
    let release: () => void = () => {};
    const gate = new Promise<void>((resolve) => (release = resolve));
    const realFetch = globalThis.fetch;
    let requests = 0;
    globalThis.fetch = (async () => {
      requests += 1;
      await gate;
      return new Response("{}");
    }) as typeof fetch;
    try {
      render(<AccountActions steamId={STEAM_ID_A} />);
      const user = setupUser();
      await user.click(screen.getByRole("button", { name: copy.reconnect }));
      const busy = await screen.findByRole("button", { name: copy.reconnecting });
      await user.click(busy);
      assert.equal(requests, 1);
      release();
      await screen.findByRole("button", { name: copy.reconnect });
    } finally {
      globalThis.fetch = realFetch;
    }
  });
});
