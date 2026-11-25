/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, test } from "node:test";
import { COPY } from "~/lib/copy/copy.config";
import type { TradeUpFinderResponse, TradeUpFinderResult } from "~/lib/items/item.types";
import { TRADEUP_DESIGN } from "~/lib/tradeup/tradeup-page.config";
import { REMOTE_STATUS } from "~/lib/storage/storage.config";
import type { RemoteData } from "~/lib/storage/storage.types";
import { installFakeApi, type FakeApi } from "~test/fake-api";
import { makeItem } from "~test/fixtures";
import { renderWithRouter } from "~test/router";
import { screen, setupUser } from "~test/ui";
import { TradeUpFinderResults } from "./tradeup-finder-results.component";
import { TRADEUP_FINDER_RESULTS } from "./tradeup-finder-results.config";

function contract(name: string, profit: number): TradeUpFinderResult {
  return {
    inputIds: [name],
    inputs: [makeItem({ id: name, name })],
    inputCost: 10,
    expectedValue: 10 + profit,
    profit,
    odds: {
      ok: true,
      inputCount: 10,
      selected: 10,
      averageFloat: 0.1,
      inputCost: 10,
      expectedValue: 10 + profit,
      chanceToProfit: 0.5,
      currency: "USD",
      outcomes: [
        {
          name: "M4A4 | Howl",
          imageUrl: null,
          rarityColor: null,
          probability: 1,
          float: 0.1,
          wearName: "FT",
          price: 50,
        },
      ],
    },
  };
}

function ready(results: TradeUpFinderResult[]): RemoteData<TradeUpFinderResponse> {
  return { status: REMOTE_STATUS.ready, data: { results, currency: "USD", searched: 100 } };
}

describe("TradeUpFinderResults", () => {
  let api: FakeApi;
  beforeEach(() => {
    api = installFakeApi();
  });
  afterEach(() => api.restore());

  test("loading shows a busy placeholder", async () => {
    await renderWithRouter(
      <TradeUpFinderResults finder={{ status: REMOTE_STATUS.loading }} onOpen={() => {}} />,
    );
    assert.equal(screen.getByRole("status").getAttribute("aria-busy"), "true");
  });

  test("an error shows the message and retries", async () => {
    let retries = 0;
    await renderWithRouter(
      <TradeUpFinderResults
        finder={{
          status: REMOTE_STATUS.error,
          message: "boom",
          retry: () => void (retries += 1),
          retrying: false,
        }}
        onOpen={() => {}}
      />,
    );
    assert.ok(screen.getByText("boom"));
    await setupUser().click(screen.getByRole("button", { name: /try again/i }));
    assert.equal(retries, 1);
  });

  test("no results shows the empty state", async () => {
    await renderWithRouter(<TradeUpFinderResults finder={ready([])} onOpen={() => {}} />);
    assert.ok(screen.getByText(TRADEUP_FINDER_RESULTS.empty.title));
  });

  test("each contract is a collapsed row that expands to show inputs and outcomes", async () => {
    await renderWithRouter(
      <TradeUpFinderResults finder={ready([contract("AK-47 | Redline", 5)])} onOpen={() => {}} />,
    );
    const toggle = screen.getByRole("button", { name: new RegExp(TRADEUP_DESIGN.contract) });
    assert.equal(toggle.getAttribute("aria-expanded"), "false");
    await setupUser().click(toggle);
    assert.equal(toggle.getAttribute("aria-expanded"), "true");
    assert.ok(screen.getByRole("button", { name: TRADEUP_DESIGN.open }));
  });

  test("Open in Trade-up passes the contract back", async () => {
    const opened: TradeUpFinderResult[] = [];
    const found = contract("AK-47 | Redline", 5);
    await renderWithRouter(
      <TradeUpFinderResults finder={ready([found])} onOpen={(c) => opened.push(c)} />,
    );
    const user = setupUser();
    await user.click(screen.getByRole("button", { name: new RegExp(TRADEUP_DESIGN.contract) }));
    await user.click(screen.getByRole("button", { name: TRADEUP_DESIGN.open }));
    assert.deepEqual(opened, [found]);
  });

  test("the search box narrows the contracts by item name", async () => {
    await renderWithRouter(
      <TradeUpFinderResults
        finder={ready([contract("AK-47 | Redline", 5), contract("AWP | Asiimov", 3)])}
        onOpen={() => {}}
      />,
    );
    await setupUser().type(
      screen.getByRole("searchbox", { name: COPY.common.searchPlaceholder }),
      "asiimov",
    );
    assert.equal(
      screen.getAllByRole("button", { name: new RegExp(TRADEUP_DESIGN.contract) }).length,
      1,
    );
  });
});
