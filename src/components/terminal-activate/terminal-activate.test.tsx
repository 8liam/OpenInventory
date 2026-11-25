/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, test } from "node:test";
import { COPY } from "~/lib/copy/copy.config";
import { STORAGE_API } from "~/lib/storage/storage.config";
import {
  accountState,
  appSnapshot,
  installFakeApi,
  STEAM_ID_A,
  STEAM_ID_B,
  type FakeApi,
} from "~test/fake-api";
import { render, screen, setupUser, waitFor } from "~test/ui";
import { TerminalActivate } from "./terminal-activate.component";

const copy = COPY.terminal;

describe("TerminalActivate", () => {
  let api: FakeApi;
  beforeEach(() => {
    api = installFakeApi();
  });
  afterEach(() => api.restore());

  test("starts as a link-style Activate trigger with no dialog", () => {
    render(<TerminalActivate itemId="t1" accountId={STEAM_ID_A} name="Terminal" />);
    assert.ok(screen.getByRole("button", { name: copy.activate }));
    assert.ok(screen.queryByRole("dialog") === null);
  });

  test("the button presentation also renders an Activate button", () => {
    render(
      <TerminalActivate itemId="t1" accountId={STEAM_ID_A} name="Terminal" presentation="button" />,
    );
    assert.ok(screen.getByRole("button", { name: copy.activate }));
  });

  test("it asks for confirmation naming the item, and sends nothing until confirmed", async () => {
    render(<TerminalActivate itemId="t1" accountId={STEAM_ID_A} name="Terminal" />);
    await setupUser().click(screen.getByRole("button", { name: copy.activate }));
    assert.ok(screen.getByRole("dialog", { name: copy.confirmTitle("Terminal") }));
    assert.equal(api.calls.length, 0);
  });

  test("confirming posts the activation for that account and item", async () => {
    render(<TerminalActivate itemId="t1" accountId={STEAM_ID_A} name="Terminal" />);
    const user = setupUser();
    await user.click(screen.getByRole("button", { name: copy.activate }));
    await user.click(screen.getByRole("checkbox", { name: copy.confirmCheckbox }));
    await user.click(screen.getByRole("button", { name: copy.confirmButton }));
    await waitFor(() => assert.equal(api.calls.length, 1));
    assert.deepEqual(api.calls[0], {
      path: STORAGE_API.activateTerminal,
      method: "POST",
      body: { accountId: STEAM_ID_A, id: "t1" },
    });
  });

  test("with several accounts the confirmation names the account", async () => {
    render(<TerminalActivate itemId="t1" accountId={STEAM_ID_B} name="Terminal" />);
    await api.push(
      appSnapshot([accountState(STEAM_ID_A), accountState(STEAM_ID_B, { displayName: "Bravo" })]),
    );
    await setupUser().click(screen.getByRole("button", { name: copy.activate }));
    assert.ok(screen.getByRole("dialog", { name: copy.confirmTitleFor("Terminal", "Bravo") }));
  });
});
