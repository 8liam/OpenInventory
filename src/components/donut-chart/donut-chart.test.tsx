/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { fireEvent } from "@testing-library/react";
import { formatMoney } from "~/utils/format";
import { render, screen } from "~test/ui";
import { DonutChart } from "./donut-chart.component";

const SLICES = [
  { label: "Rifles", value: 75, count: 3, color: "#111" },
  { label: "Pistols", value: 25, count: 1, color: "#222" },
] as const;

describe("DonutChart", () => {
  test("shows the total in the centre under the label", () => {
    render(<DonutChart slices={SLICES} currency="USD" totalLabel="Total value" />);
    assert.ok(screen.getByRole("img", { name: "Total value" }));
    assert.ok(screen.getByText(formatMoney(100, "USD")));
  });

  test("renders a segment per slice", () => {
    const { container } = render(<DonutChart slices={SLICES} currency="USD" totalLabel="Total" />);
    assert.equal(container.querySelectorAll("circle").length, 2);
  });

  test("hovering a segment reads out that slice with its share", () => {
    const { container } = render(<DonutChart slices={SLICES} currency="USD" totalLabel="Total" />);
    const [first] = container.querySelectorAll("circle");
    assert.ok(first);
    fireEvent.pointerEnter(first);
    assert.ok(screen.getByText("Rifles"));
    assert.ok(screen.getByText("75%", { exact: false }));
  });

  test("formatValue replaces the money formatting", () => {
    render(
      <DonutChart
        slices={SLICES}
        currency="USD"
        totalLabel="Items"
        formatValue={(v) => `${v} items`}
      />,
    );
    assert.ok(screen.getByText("100 items"));
  });

  test("with no value there is no chart", () => {
    const { container } = render(<DonutChart slices={[]} currency="USD" totalLabel="Total" />);
    assert.equal(container.innerHTML, "");
  });
});
