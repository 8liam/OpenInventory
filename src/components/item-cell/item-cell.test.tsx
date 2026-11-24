/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, test } from "node:test";
import { COPY } from "~/lib/copy/copy.config";
import { installFakeApi, type FakeApi } from "~test/fake-api";
import { makeItem } from "~test/fixtures";
import { renderWithRouter } from "~test/router";
import { screen } from "~test/ui";
import { ItemCell } from "./item-cell.component";

describe("ItemCell", () => {
  let api: FakeApi;
  beforeEach(() => {
    api = installFakeApi();
  });
  afterEach(() => api.restore());

  test("shows the item's weapon and skin", async () => {
    await renderWithRouter(<ItemCell item={makeItem({ name: "AK-47 | Redline" })} />);
    assert.ok(screen.getByText("AK-47"));
    assert.ok(screen.getByText("Redline"));
  });

  test("shows an account name and detail line when given", async () => {
    await renderWithRouter(<ItemCell item={makeItem()} account="Alpha" detail="Seed 661" />);
    assert.ok(screen.getByText("Alpha"));
    assert.ok(screen.getByText("Seed 661"));
  });

  test("a sealed terminal says so and has no offers link", async () => {
    const item = makeItem({ terminal: { isActive: false, expiresAt: null, isFinalOffer: false } });
    await renderWithRouter(<ItemCell item={item} />);
    assert.ok(screen.getAllByText(COPY.terminal.sealed, { exact: false }).length >= 1);
    assert.ok(screen.queryByRole("link", { name: COPY.terminal.viewOffer }) === null);
  });

  test("an active terminal says active", async () => {
    const item = makeItem({ terminal: { isActive: true, expiresAt: null, isFinalOffer: false } });
    await renderWithRouter(<ItemCell item={item} />);
    assert.ok(screen.getAllByText(COPY.terminal.active, { exact: false }).length >= 1);
    assert.equal(screen.getByRole("link", { name: COPY.terminal.viewOffer }).getAttribute("href"), "/terminals");
  });

  test("a plain item has no terminal link", async () => {
    await renderWithRouter(<ItemCell item={makeItem()} />);
    assert.ok(screen.queryByRole("link") === null);
  });
});
