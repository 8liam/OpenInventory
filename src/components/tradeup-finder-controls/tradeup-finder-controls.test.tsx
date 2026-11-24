/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { TRADE_UP_STATTRAK_FILTER } from "~/lib/storage/storage.config";
import { render, screen, setupUser } from "~test/ui";
import { TradeUpFinderControls } from "./tradeup-finder-controls.component";
import { TRADEUP_FINDER_CONTROLS } from "./tradeup-finder-controls.config";

const copy = TRADEUP_FINDER_CONTROLS;

describe("TradeUpFinderControls", () => {
  test("is a region with a heading, a StatTrak select and the storage checkbox", () => {
    render(
      <TradeUpFinderControls
        statTrak={TRADE_UP_STATTRAK_FILTER.all}
        onStatTrakChange={() => {}}
        includeStorage={false}
        onIncludeStorageChange={() => {}}
      />,
    );
    assert.ok(screen.getByRole("region", { name: copy.title }));
    assert.ok(screen.getByRole("combobox", { name: copy.statTrakLabel }));
    assert.equal((screen.getByRole("checkbox", { name: copy.includeStorage }) as HTMLInputElement).checked, false);
  });

  test("toggling the checkbox reports the new value", async () => {
    const seen: boolean[] = [];
    render(
      <TradeUpFinderControls
        statTrak={TRADE_UP_STATTRAK_FILTER.all}
        onStatTrakChange={() => {}}
        includeStorage={false}
        onIncludeStorageChange={(next) => seen.push(next)}
      />,
    );
    await setupUser().click(screen.getByRole("checkbox", { name: copy.includeStorage }));
    assert.deepEqual(seen, [true]);
  });

  test("choosing a StatTrak filter reports it", async () => {
    const seen: string[] = [];
    render(
      <TradeUpFinderControls
        statTrak={TRADE_UP_STATTRAK_FILTER.all}
        onStatTrakChange={(filter) => seen.push(filter)}
        includeStorage
        onIncludeStorageChange={() => {}}
      />,
    );
    const user = setupUser();
    await user.click(screen.getByRole("combobox", { name: copy.statTrakLabel }));
    const other = screen.getAllByRole("option").find((option) => option.getAttribute("aria-selected") === "false");
    assert.ok(other);
    await user.click(other);
    assert.equal(seen.length, 1);
    assert.notEqual(seen[0], TRADE_UP_STATTRAK_FILTER.all);
  });
});
