/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, test } from "node:test";
import type { TransferState } from "~/lib/storage/storage.types";
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
import { TransferStatus } from "./transfer-status.component";
import { TRANSFER_STATUS } from "./transfer-status.config";

function withTransfer(id: string, transfer: TransferState, displayName = "Alpha") {
  return accountState(id, { displayName, snapshot: storageSnapshot({ transfer }) });
}

const RUNNING: TransferState = {
  status: "running",
  total: 10,
  done: 4,
  fromName: "Inventory",
  toName: "Unit A",
  plan: null,
};
const FINISHED: TransferState = {
  status: "finished",
  total: 10,
  done: 8,
  fromName: "Inventory",
  toName: "Unit A",
  cancelled: false,
  failures: [{ itemId: "x", name: "AK-47", reason: "locked" }],
  plan: null,
};

describe("TransferStatus", () => {
  let api: FakeApi;
  beforeEach(() => {
    api = installFakeApi();
  });
  afterEach(() => api.restore());

  test("the live region exists even with nothing to show", async () => {
    render(<TransferStatus />);
    await api.push(appSnapshot([accountState(STEAM_ID_A)]));
    assert.ok(screen.getByRole("status", { name: TRANSFER_STATUS.regionLabel }));
    assert.ok(screen.queryByRole("progressbar") === null);
  });

  test("a running transfer shows progress and its text", async () => {
    render(<TransferStatus />);
    await api.push(appSnapshot([withTransfer(STEAM_ID_A, RUNNING)]));
    const bar = screen.getByRole("progressbar", { name: TRANSFER_STATUS.progressLabel });
    assert.equal(bar.getAttribute("aria-valuenow"), "4");
    assert.equal(bar.getAttribute("aria-valuemax"), "10");
    assert.ok(
      screen.getByText(TRANSFER_STATUS.running(4, 10, "Inventory", "Unit A"), { exact: false }),
    );
  });

  test("Cancel posts the account and shows that it is stopping", async () => {
    render(<TransferStatus />);
    await api.push(appSnapshot([withTransfer(STEAM_ID_A, RUNNING)]));
    await setupUser().click(screen.getByRole("button", { name: TRANSFER_STATUS.cancel }));
    await waitFor(() => assert.equal(api.calls[0]?.path, STORAGE_API.transferCancel));
    assert.ok(await screen.findByText(TRANSFER_STATUS.cancelling, { exact: false }));
  });

  test("a finished transfer shows the result, its failures and Dismiss", async () => {
    render(<TransferStatus />);
    await api.push(appSnapshot([withTransfer(STEAM_ID_A, FINISHED)]));
    assert.ok(screen.getByText(TRANSFER_STATUS.finished(8, 10, "Unit A"), { exact: false }));
    assert.ok(screen.getByText(/AK-47: locked/));
    await setupUser().click(screen.getByRole("button", { name: TRANSFER_STATUS.dismiss }));
    await waitFor(() => assert.equal(api.calls[0]?.path, STORAGE_API.transferDismiss));
  });

  test("failures beyond the limit fold into a count", async () => {
    const many = Array.from({ length: TRANSFER_STATUS.maxFailuresShown + 3 }, (_, i) => ({
      itemId: String(i),
      name: `Item ${i}`,
      reason: "no",
    }));
    render(<TransferStatus />);
    await api.push(appSnapshot([withTransfer(STEAM_ID_A, { ...FINISHED, failures: many })]));
    assert.ok(screen.getByText(TRANSFER_STATUS.moreFailures(3)));
  });

  test("an organiser plan names its steps", async () => {
    render(<TransferStatus />);
    await api.push(
      appSnapshot([
        withTransfer(STEAM_ID_A, { ...FINISHED, plan: { step: 2, steps: 2 }, failures: [] }),
      ]),
    );
    assert.ok(screen.getByText(TRANSFER_STATUS.planFinished(8, 10, 2), { exact: false }));
  });

  test("each account with a transfer gets its own banner", async () => {
    render(<TransferStatus />);
    await api.push(
      appSnapshot([
        withTransfer(STEAM_ID_A, RUNNING, "Alpha"),
        withTransfer(STEAM_ID_B, RUNNING, "Bravo"),
      ]),
    );
    assert.equal(screen.getAllByRole("progressbar").length, 2);
  });
});
