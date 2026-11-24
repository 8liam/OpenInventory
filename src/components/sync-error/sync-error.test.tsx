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
  storageSnapshot,
  type FakeApi,
} from "~test/fake-api";
import { render, screen, setupUser, waitFor } from "~test/ui";
import { SYNC_ERROR } from "./sync-error.config";
import { SyncError } from "./sync-error.component";

describe("SyncError", () => {
  let api: FakeApi;
  beforeEach(() => {
    api = installFakeApi();
  });
  afterEach(() => api.restore());

  test("renders nothing for healthy accounts", async () => {
    render(<SyncError />);
    await api.push(appSnapshot([accountState(STEAM_ID_A)]));
    assert.ok(screen.queryByRole("alert") === null);
  });

  test("shows the failure and Try again requests a refresh for that account", async () => {
    render(<SyncError />);
    await api.push(
      appSnapshot([accountState(STEAM_ID_A, { snapshot: storageSnapshot({ syncError: "CS2 is running elsewhere" }) })]),
    );
    assert.equal(screen.getByRole("alert").textContent?.includes("CS2 is running elsewhere"), true);
    await setupUser().click(screen.getByRole("button", { name: SYNC_ERROR.retry }));
    await waitFor(() => assert.ok(api.calls[0]?.path.startsWith(STORAGE_API.refresh)));
    assert.deepEqual(api.calls[0]?.body, { accountId: STEAM_ID_A });
  });

  test("with several accounts the banner names the affected one", async () => {
    render(<SyncError />);
    await api.push(
      appSnapshot([
        accountState(STEAM_ID_A, { displayName: "Alpha", snapshot: storageSnapshot({ syncError: "boom" }) }),
        accountState(STEAM_ID_B, { displayName: "Bravo" }),
      ]),
    );
    assert.equal(screen.getAllByRole("alert").length, 1);
    assert.ok(screen.getByText(COPY.accounts.bannerFor("Alpha", "boom")));
  });

  test("the button is disabled while units are loading", async () => {
    render(<SyncError />);
    await api.push(
      appSnapshot([
        accountState(STEAM_ID_A, { snapshot: storageSnapshot({ syncError: "boom", loadingUnits: true }) }),
      ]),
    );
    const button = screen.getByRole("button", { name: SYNC_ERROR.retrying }) as HTMLButtonElement;
    assert.equal(button.disabled, true);
  });
});
