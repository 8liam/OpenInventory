/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { render, screen } from "~test/ui";
import { Metric } from "./metric.component";

describe("Metric", () => {
  test("shows label and value", () => {
    render(<Metric label="Total" value="$10" />);
    assert.ok(screen.getByText("Total"));
    assert.ok(screen.getByText("$10"));
  });

  test("shows the detail only when given", () => {
    const { rerender } = render(<Metric label="Total" value="1" />);
    assert.ok(screen.queryByText("+5%") === null);
    rerender(<Metric label="Total" value="1" detail="+5%" tone="positive" />);
    assert.ok(screen.getByText("+5%"));
  });
});
