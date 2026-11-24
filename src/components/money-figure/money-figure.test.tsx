/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { formatMoney } from "~/utils/format";
import { render, screen } from "~test/ui";
import { MoneyFigure } from "./money-figure.component";

describe("MoneyFigure", () => {
  test("exposes the whole formatted amount to assistive tech", () => {
    render(<MoneyFigure amount={1234.56} currency="USD" />);
    assert.ok(screen.getByText(formatMoney(1234.56, "USD")));
  });

  test("the visual parts are hidden from assistive tech", () => {
    const { container } = render(<MoneyFigure amount={1234.56} currency="USD" />);
    assert.ok(container.querySelector("[aria-hidden]"));
    assert.ok(container.textContent?.includes("1,234"));
  });
});
