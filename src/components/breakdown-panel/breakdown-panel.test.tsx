/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { COPY } from "~/lib/copy/copy.config";
import { makeDashboard, makeSlice } from "~test/fixtures";
import { render, screen, setupUser } from "~test/ui";
import { BreakdownPanel } from "./breakdown-panel.component";
import { BREAKDOWN_PANEL } from "./breakdown-panel.config";

describe("BreakdownPanel", () => {
  test("shows the title and a tab per question, the first selected", () => {
    render(<BreakdownPanel dashboard={makeDashboard()} currency="USD" />);
    assert.ok(screen.getByRole("heading", { level: 2, name: COPY.dashboard.breakdownTitle }));
    assert.equal(screen.getAllByRole("tab").length, BREAKDOWN_PANEL.tabs.length);
    assert.equal(screen.getByRole("tab", { name: "Type" }).getAttribute("aria-selected"), "true");
    assert.ok(screen.getByText("Rifles"));
  });

  test("selecting another tab swaps the rows", async () => {
    render(<BreakdownPanel dashboard={makeDashboard()} currency="USD" />);
    await setupUser().click(screen.getByRole("tab", { name: "Rarity" }));
    assert.equal(screen.getByRole("tab", { name: "Rarity" }).getAttribute("aria-selected"), "true");
    assert.ok(screen.getByText("Covert"));
    assert.ok(screen.queryByText("Rifles") === null);
  });

  test("headingLevel 4 renders an h4", () => {
    render(<BreakdownPanel dashboard={makeDashboard()} currency="USD" headingLevel={4} />);
    assert.ok(screen.getByRole("heading", { level: 4 }));
  });

  test("an empty breakdown renders without rows", () => {
    render(<BreakdownPanel dashboard={makeDashboard({ byCategory: [] })} currency="USD" />);
    assert.equal(screen.queryAllByRole("listitem").length, 0);
  });

  test("a tail of tiny slices is folded into Other", () => {
    const many = Array.from({ length: BREAKDOWN_PANEL.rowLimit + 3 }, (_, i) =>
      makeSlice(`Type ${i}`, 10 - i * 0.1, 1),
    );
    render(<BreakdownPanel dashboard={makeDashboard({ byCategory: many })} currency="USD" />);
    assert.ok(screen.getByText(COPY.dashboard.otherLabel));
  });
});
