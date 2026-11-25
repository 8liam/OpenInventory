/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { render } from "~test/ui";
import { TradeUpSkeleton } from "./tradeup-skeleton.component";

test("TradeUpSkeleton renders a non-empty placeholder", () => {
  const { container } = render(<TradeUpSkeleton />);
  assert.ok(container.firstElementChild);
});
