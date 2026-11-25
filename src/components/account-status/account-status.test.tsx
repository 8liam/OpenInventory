/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { COPY } from "~/lib/copy/copy.config";
import { AUTH_STATUS } from "~/lib/storage/storage.config";
import { accountState, STEAM_ID_A, storageSnapshot } from "~test/fake-api";
import { render, screen } from "~test/ui";
import { AccountStatus } from "./account-status.component";

const copy = COPY.accounts;

describe("AccountStatus", () => {
  test("an errored account shows the message as an alert with recovery actions", () => {
    const account = accountState(STEAM_ID_A, {
      snapshot: storageSnapshot({ auth: { status: AUTH_STATUS.error, message: "Bad login" } }),
    });
    render(<AccountStatus account={account} />);
    assert.equal(screen.getByRole("alert").textContent, "Bad login");
    assert.ok(screen.getByRole("button", { name: copy.reconnect }));
    assert.ok(screen.getByRole("button", { name: copy.signInAgain }));
  });

  test("a connecting account shows the connection detail", () => {
    const account = accountState(STEAM_ID_A, {
      snapshot: storageSnapshot({ auth: { status: AUTH_STATUS.connecting, detail: "Logging on" } }),
    });
    render(<AccountStatus account={account} />);
    assert.equal(screen.getByRole("status").textContent, "Logging on");
    assert.ok(screen.queryByRole("alert") === null);
  });

  test("an idle account shows the generic connecting line", () => {
    const account = accountState(STEAM_ID_A, {
      snapshot: storageSnapshot({ auth: { status: AUTH_STATUS.idle } }),
    });
    render(<AccountStatus account={account} />);
    assert.equal(screen.getByRole("status").textContent, copy.connecting);
  });

  test("the region is named after the account", () => {
    const account = accountState(STEAM_ID_A, {
      displayName: "Alpha",
      snapshot: storageSnapshot({ auth: { status: AUTH_STATUS.idle } }),
    });
    render(<AccountStatus account={account} />);
    assert.ok(screen.getByRole("region", { name: copy.notReadyTitle("Alpha") }));
  });
});
