/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, test } from "node:test";
import { useAccountSelection } from "~/lib/accounts/account-scope.store";
import { AUTH_STATUS, STORAGE_API } from "~/lib/storage/storage.config";
import {
  accountState,
  appSnapshot,
  installFakeApi,
  STEAM_ID_A,
  storageSnapshot,
  type FakeApi,
} from "~test/fake-api";
import { render, waitFor } from "~test/ui";
import { InventoryPrefetch } from "./inventory-prefetch.component";

describe("InventoryPrefetch", () => {
  let api: FakeApi;
  beforeEach(() => {
    api = installFakeApi();
    useAccountSelection.setState({ selected: STEAM_ID_A });
  });
  afterEach(() => api.restore());

  test("renders nothing", async () => {
    const { container } = render(<InventoryPrefetch />);
    await api.push(appSnapshot([accountState(STEAM_ID_A)]));
    assert.equal(container.textContent, "");
  });

  test("fetches the scoped inventory once a connected account exists", async () => {
    api.respond(STORAGE_API.items, () => ({ body: { items: [] } }));
    render(<InventoryPrefetch />);
    await api.push(appSnapshot([accountState(STEAM_ID_A)]));
    await waitFor(() => assert.ok(api.calls.some((call) => call.path.startsWith(STORAGE_API.items))));
    const call = api.calls.find((c) => c.path.startsWith(STORAGE_API.items));
    assert.ok(call?.path.includes(`account=${STEAM_ID_A}`));
  });

  test("does not fetch while the account is not connected", async () => {
    render(<InventoryPrefetch />);
    await api.push(
      appSnapshot([
        accountState(STEAM_ID_A, { snapshot: storageSnapshot({ auth: { status: AUTH_STATUS.connecting, detail: "x" } }) }),
      ]),
    );
    await new Promise((resolve) => setTimeout(resolve, 50));
    assert.equal(api.calls.filter((c) => c.path.startsWith(STORAGE_API.items)).length, 0);
  });
});
