/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { fireEvent } from "@testing-library/react";
import { makeHistory } from "~test/fixtures";
import { render, screen, waitFor } from "~test/ui";
import { ValueChart } from "./value-chart.component";

const POINTS = makeHistory(6).map((point) => ({ takenAt: point.takenAt, value: point.totalValue }));

describe("ValueChart", () => {
  test("draws a labelled chart once it has a width and two points", async () => {
    render(<ValueChart points={POINTS} currency="USD" tone="up" />);
    assert.ok(await screen.findByRole("img", { name: "Value over time" }));
  });

  test("with one point there is nothing to draw", async () => {
    render(<ValueChart points={POINTS.slice(0, 1)} currency="USD" tone="up" />);
    await new Promise((resolve) => setTimeout(resolve, 20));
    assert.ok(screen.queryByRole("img") === null);
  });

  test("moving over the chart shows the nearest point's value and date, leaving hides it", async () => {
    render(<ValueChart points={POINTS} currency="USD" tone="down" />);
    const chart = await screen.findByRole("img", { name: "Value over time" });
    fireEvent.pointerMove(chart, { clientX: 0 });
    await waitFor(() => assert.ok(document.body.textContent?.includes("$100.00")));
    fireEvent.pointerLeave(chart);
    await waitFor(() => assert.ok(!document.body.textContent?.includes("$100.00")));
  });
});
