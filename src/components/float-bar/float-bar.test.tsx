/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { render, screen } from "~test/ui";
import { FloatBar } from "./float-bar.component";
import { FLOAT_BAR } from "./float-bar.config";

describe("FloatBar", () => {
  test("is a meter on a 0..1 scale carrying the float and its spoken text", () => {
    render(<FloatBar value={0.12} valueText="0.12, Minimal Wear" />);
    const meter = screen.getByRole("meter", { name: FLOAT_BAR.label });
    assert.equal(meter.getAttribute("aria-valuemin"), "0");
    assert.equal(meter.getAttribute("aria-valuemax"), "1");
    assert.equal(meter.getAttribute("aria-valuenow"), "0.12");
    assert.equal(meter.getAttribute("aria-valuetext"), "0.12, Minimal Wear");
  });

  test("a value outside the scale is clamped", () => {
    const { rerender } = render(<FloatBar value={1.7} valueText="x" />);
    assert.equal(screen.getByRole("meter").getAttribute("aria-valuenow"), "1");
    rerender(<FloatBar value={-0.2} valueText="x" />);
    assert.equal(screen.getByRole("meter").getAttribute("aria-valuenow"), "0");
  });

  test("accepts the skin's own range, or none", () => {
    const { rerender } = render(<FloatBar value={0.1} minWear={0.06} maxWear={0.8} valueText="x" />);
    assert.ok(screen.getByRole("meter"));
    rerender(<FloatBar value={0.1} minWear={null} maxWear={null} valueText="x" />);
    assert.ok(screen.getByRole("meter"));
  });
});
