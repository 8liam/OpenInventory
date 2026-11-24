/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, test } from "node:test";
import { COPY } from "~/lib/copy/copy.config";
import { STORAGE_API } from "~/lib/storage/storage.config";
import type { TerminalOffer } from "~/lib/items/item.types";
import { installFakeApi, STEAM_ID_A, type FakeApi } from "~test/fake-api";
import { makeItem } from "~test/fixtures";
import { render, screen, setupUser, waitFor } from "~test/ui";
import { OfferPanel } from "./offer-panel.component";

const copy = COPY.terminal;

function offer(overrides: Partial<TerminalOffer> = {}): TerminalOffer {
  const { price: _price, ...base } = makeItem({ name: "AK-47 | Redline", price: 10 });
  return { ...base, purchaseCost: 5, price: 10, ...overrides } as TerminalOffer;
}

describe("OfferPanel", () => {
  let api: FakeApi;
  beforeEach(() => {
    api = installFakeApi();
  });
  afterEach(() => api.restore());

  test("asks Steam for the offer of this terminal and account", async () => {
    api.respond(STORAGE_API.terminalOffer, () => ({ body: { offers: [offer()], isFinalOffer: false, currency: "USD" } }));
    render(<OfferPanel terminalId="t1" accountId={STEAM_ID_A} />);
    await screen.findByText("Redline");
    assert.ok(api.calls[0]?.path.startsWith(STORAGE_API.terminalOffer));
    assert.deepEqual(api.calls[0]?.body, { accountId: STEAM_ID_A, id: "t1" });
  });

  test("an offer is shown with a Next offer button while more may come", async () => {
    api.respond(STORAGE_API.terminalOffer, () => ({ body: { offers: [offer()], isFinalOffer: false, currency: "USD" } }));
    render(<OfferPanel terminalId="t1" accountId={STEAM_ID_A} />);
    assert.ok(await screen.findByRole("button", { name: copy.nextOffer }));
  });

  test("the final offer says so and has no Next button", async () => {
    api.respond(STORAGE_API.terminalOffer, () => ({ body: { offers: [offer()], isFinalOffer: true, currency: "USD" } }));
    render(<OfferPanel terminalId="t1" accountId={STEAM_ID_A} />);
    assert.ok(await screen.findByText(copy.finalOffer));
    assert.ok(screen.queryByRole("button", { name: copy.nextOffer }) === null);
  });

  test("a failed request shows the error", async () => {
    api.respond(STORAGE_API.terminalOffer, () => ({ status: 500, body: { error: "steam down" } }));
    render(<OfferPanel terminalId="t1" accountId={STEAM_ID_A} />);
    assert.equal((await screen.findByRole("alert")).textContent, "steam down");
  });

  test("Next offer needs confirmation, then asks for it and remembers the previous one", async () => {
    api.respond(STORAGE_API.terminalOffer, () => ({ body: { offers: [offer({ price: 10 })], isFinalOffer: false, currency: "USD" } }));
    api.respond(STORAGE_API.terminalNextOffer, () => ({
      body: { offers: [offer({ name: "M4A4 | Howl", price: 99 })], isFinalOffer: true, currency: "USD" },
    }));
    render(<OfferPanel terminalId="t1" accountId={STEAM_ID_A} />);
    const user = setupUser();
    await user.click(await screen.findByRole("button", { name: copy.nextOffer }));
    assert.ok(!api.calls.some((call) => call.path.startsWith(STORAGE_API.terminalNextOffer)));
    await user.click(screen.getByRole("checkbox", { name: copy.nextCheckbox }));
    await user.click(screen.getByRole("button", { name: copy.nextConfirm }));
    await waitFor(() => assert.ok(api.calls.some((call) => call.path.startsWith(STORAGE_API.terminalNextOffer))));
    assert.ok(await screen.findByText("Howl"));
    assert.ok(screen.getByText(copy.earlierOffers));
  });
});
