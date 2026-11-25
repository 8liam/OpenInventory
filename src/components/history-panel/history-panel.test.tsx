/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, test } from "node:test";
import { makeHistory } from "~test/fixtures";
import { render, screen, setupUser } from "~test/ui";
import { HistoryPanel } from "./history-panel.component";
import { HISTORY_PANEL } from "./history-panel.config";

describe("HistoryPanel", () => {
  test("series pills switch which series is pressed", async () => {
    render(<HistoryPanel history={makeHistory(5)} currency="USD" />);
    assert.equal(
      screen.getByRole("button", { name: "Total" }).getAttribute("aria-pressed"),
      "true",
    );
    await setupUser().click(screen.getByRole("button", { name: "Inventory" }));
    assert.equal(
      screen.getByRole("button", { name: "Inventory" }).getAttribute("aria-pressed"),
      "true",
    );
    assert.equal(
      screen.getByRole("button", { name: "Total" }).getAttribute("aria-pressed"),
      "false",
    );
  });

  test("a range with too few points is disabled", () => {
    render(<HistoryPanel history={makeHistory(5, Date.now())} currency="USD" />);
    // Points are a day apart, so 1D holds two and 1W holds five: both selectable.
    assert.equal(
      (screen.getByRole("button", { name: "All time" }) as HTMLButtonElement).disabled,
      false,
    );
    const sparse = makeHistory(2, Date.now()).map((point, index) => ({
      ...point,
      takenAt: Date.now() - index * 400 * 86_400_000,
    }));
    const { unmount } = render(<HistoryPanel history={sparse.reverse()} currency="USD" />);
    assert.equal(
      (screen.getAllByRole("button", { name: "1D" }).at(-1) as HTMLButtonElement).disabled,
      true,
    );
    unmount();
  });

  test("an empty range shows the empty message", () => {
    render(<HistoryPanel history={makeHistory(1)} currency="USD" />);
    assert.ok(screen.getByText(HISTORY_PANEL.copy.empty));
  });

  describe("export", () => {
    const realCreate = URL.createObjectURL;
    const realRevoke = URL.revokeObjectURL;
    const realClick = HTMLAnchorElement.prototype.click;
    let blobs: Blob[] = [];
    let downloads: string[] = [];
    beforeEach(() => {
      blobs = [];
      downloads = [];
      URL.createObjectURL = (blob: Blob | MediaSource) => {
        blobs.push(blob as Blob);
        return "blob:test";
      };
      URL.revokeObjectURL = () => {};
      HTMLAnchorElement.prototype.click = function click(this: HTMLAnchorElement) {
        downloads.push(this.download);
      };
    });
    afterEach(() => {
      URL.createObjectURL = realCreate;
      URL.revokeObjectURL = realRevoke;
      HTMLAnchorElement.prototype.click = realClick;
    });

    test("CSV downloads a csv file", async () => {
      render(<HistoryPanel history={makeHistory(5)} currency="USD" />);
      await setupUser().click(screen.getByRole("button", { name: "CSV" }));
      assert.equal(blobs.length, 1);
      assert.ok(blobs[0]?.type.startsWith("text/csv"));
      assert.ok(downloads[0]?.endsWith(".csv"));
    });

    test("JSON downloads a json file", async () => {
      render(<HistoryPanel history={makeHistory(5)} currency="USD" />);
      await setupUser().click(screen.getByRole("button", { name: "JSON" }));
      assert.ok(blobs[0]?.type.startsWith("application/json"));
      assert.ok(downloads[0]?.endsWith(".json"));
    });
  });
});
