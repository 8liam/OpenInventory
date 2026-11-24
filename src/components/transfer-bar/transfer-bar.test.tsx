/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, test } from "node:test";
import { COPY } from "~/lib/copy/copy.config";
import { INVENTORY_LOCATION_ID } from "~/lib/items/item.types";
import { STORAGE_API } from "~/lib/storage/storage.config";
import { installFakeApi, STEAM_ID_A, STEAM_ID_B, type FakeApi } from "~test/fake-api";
import { makeItem } from "~test/fixtures";
import { render, screen, setupUser, waitFor } from "~test/ui";
import { TransferBar } from "./transfer-bar.component";
import { TRANSFER_BAR } from "./transfer-bar.config";

const UNITS = [
  { id: "u1", name: "Unit A", itemCount: 10, loaded: true },
  { id: "u2", name: "Unit B", itemCount: 5, loaded: true },
];
const ITEM = makeItem({ id: "i1", accountId: STEAM_ID_A, locationId: INVENTORY_LOCATION_ID });

describe("TransferBar", () => {
  let api: FakeApi;
  beforeEach(() => {
    api = installFakeApi();
  });
  afterEach(() => api.restore());

  test("is a labelled region with the selection count and a Clear button", async () => {
    let cleared = 0;
    render(<TransferBar selected={[ITEM]} units={UNITS} busy={false} onClear={() => void (cleared += 1)} />);
    assert.ok(screen.getByRole("region", { name: TRANSFER_BAR.regionLabel }));
    assert.ok(screen.getByText(TRANSFER_BAR.selectedLabel(1)));
    await setupUser().click(screen.getByRole("button", { name: TRANSFER_BAR.clear }));
    assert.equal(cleared, 1);
  });

  test("Move stays disabled until a destination is chosen", async () => {
    render(<TransferBar selected={[ITEM]} units={UNITS} busy={false} onClear={() => {}} />);
    assert.equal((screen.getByRole("button", { name: TRANSFER_BAR.move }) as HTMLButtonElement).disabled, true);
    const user = setupUser();
    await user.click(screen.getByRole("combobox", { name: TRANSFER_BAR.destination }));
    await user.click(screen.getByRole("option", { name: /Unit A/ }));
    assert.equal((screen.getByRole("button", { name: TRANSFER_BAR.move }) as HTMLButtonElement).disabled, false);
  });

  test("from the inventory the destinations are the units, not the inventory itself", async () => {
    render(<TransferBar selected={[ITEM]} units={UNITS} busy={false} onClear={() => {}} />);
    await setupUser().click(screen.getByRole("combobox", { name: TRANSFER_BAR.destination }));
    const names = screen.getAllByRole("option").map((option) => option.textContent ?? "");
    assert.ok(!names.some((text) => text.startsWith(TRANSFER_BAR.inventory)));
    assert.ok(names.some((text) => text.includes("Unit A")));
  });

  test("a unit that cannot take the whole selection is disabled", async () => {
    const full = [{ id: "u1", name: "Unit A", itemCount: 1000, loaded: true }];
    render(<TransferBar selected={[ITEM]} units={full} busy={false} onClear={() => {}} />);
    await setupUser().click(screen.getByRole("combobox", { name: TRANSFER_BAR.destination }));
    assert.equal(screen.getByRole("option", { name: /Unit A/ }).getAttribute("aria-disabled"), "true");
  });

  test("Move asks to confirm, then posts the transfer and clears the selection", async () => {
    let cleared = 0;
    render(<TransferBar selected={[ITEM]} units={UNITS} busy={false} onClear={() => void (cleared += 1)} />);
    const user = setupUser();
    await user.click(screen.getByRole("combobox", { name: TRANSFER_BAR.destination }));
    await user.click(screen.getByRole("option", { name: /Unit A/ }));
    await user.click(screen.getByRole("button", { name: TRANSFER_BAR.move }));
    assert.ok(screen.getByText(TRANSFER_BAR.confirm(1, TRANSFER_BAR.inventory, "Unit A")));
    assert.equal(api.calls.length, 0);
    await user.click(screen.getByRole("button", { name: TRANSFER_BAR.confirmButton }));
    await waitFor(() => assert.equal(api.calls.length, 1));
    assert.deepEqual(api.calls[0], {
      path: STORAGE_API.transfer,
      method: "POST",
      body: { accountId: STEAM_ID_A, from: INVENTORY_LOCATION_ID, to: "u1", itemIds: ["i1"] },
    });
    await waitFor(() => assert.equal(cleared, 1));
  });

  test("Back leaves confirmation without sending anything", async () => {
    render(<TransferBar selected={[ITEM]} units={UNITS} busy={false} onClear={() => {}} />);
    const user = setupUser();
    await user.click(screen.getByRole("combobox", { name: TRANSFER_BAR.destination }));
    await user.click(screen.getByRole("option", { name: /Unit B/ }));
    await user.click(screen.getByRole("button", { name: TRANSFER_BAR.move }));
    await user.click(screen.getByRole("button", { name: TRANSFER_BAR.back }));
    assert.ok(screen.getByRole("button", { name: TRANSFER_BAR.move }));
    assert.equal(api.calls.length, 0);
  });

  test("a failed transfer shows the error and keeps the selection", async () => {
    api.respond(STORAGE_API.transfer, () => ({ status: 409, body: { error: "unit full" } }));
    let cleared = 0;
    render(<TransferBar selected={[ITEM]} units={UNITS} busy={false} onClear={() => void (cleared += 1)} />);
    const user = setupUser();
    await user.click(screen.getByRole("combobox", { name: TRANSFER_BAR.destination }));
    await user.click(screen.getByRole("option", { name: /Unit A/ }));
    await user.click(screen.getByRole("button", { name: TRANSFER_BAR.move }));
    await user.click(screen.getByRole("button", { name: TRANSFER_BAR.confirmButton }));
    assert.equal((await screen.findByRole("alert")).textContent, "unit full");
    assert.equal(cleared, 0);
  });

  test("items from two locations cannot be moved together", () => {
    const other = makeItem({ id: "i2", locationId: "u1" });
    render(<TransferBar selected={[ITEM, other]} units={UNITS} busy={false} onClear={() => {}} />);
    assert.ok(screen.getByText(TRANSFER_BAR.mixed));
    assert.equal((screen.getByRole("button", { name: TRANSFER_BAR.move }) as HTMLButtonElement).disabled, true);
  });

  test("items from two accounts cannot be moved together", () => {
    const other = makeItem({ id: "i2", accountId: STEAM_ID_B });
    render(<TransferBar selected={[ITEM, other]} units={UNITS} busy={false} onClear={() => {}} />);
    assert.ok(screen.getByText(COPY.accounts.mixedAccounts));
  });

  test("while another transfer runs the bar says so and cannot move", () => {
    render(<TransferBar selected={[ITEM]} units={UNITS} busy onClear={() => {}} />);
    assert.ok(screen.getByText(TRANSFER_BAR.busy));
    assert.equal((screen.getByRole("button", { name: TRANSFER_BAR.move }) as HTMLButtonElement).disabled, true);
  });
});
