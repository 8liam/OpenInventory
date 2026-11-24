/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { COPY } from "~/lib/copy/copy.config";
import { formatSignedMoney } from "~/utils/format";
import { render, screen } from "~test/ui";
import { ChangeLine } from "./change-line.component";

describe("ChangeLine", () => {
  test("shows each known window with its signed amount", () => {
    render(<ChangeLine currency="USD" change={{ day: 5, week: -2, month: 10 }} />);
    for (const [label, amount] of [
      [COPY.dashboard.change.day, 5],
      [COPY.dashboard.change.week, -2],
      [COPY.dashboard.change.month, 10],
    ] as const) {
      assert.ok(screen.getByText(label));
      assert.ok(screen.getByText(formatSignedMoney(amount, "USD"), { exact: false }));
    }
  });

  test("skips windows that are unknown", () => {
    render(<ChangeLine currency="USD" change={{ day: 5, week: null, month: null }} />);
    assert.ok(screen.getByText(COPY.dashboard.change.day));
    assert.ok(screen.queryByText(COPY.dashboard.change.week) === null);
    assert.ok(screen.queryByText(COPY.dashboard.change.month) === null);
  });

  test("renders nothing when every window is unknown", () => {
    const { container } = render(
      <ChangeLine currency="USD" change={{ day: null, week: null, month: null }} />,
    );
    assert.equal(container.textContent, "");
  });
});
