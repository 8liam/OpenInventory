/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { render } from "~test/ui";
import { DashboardSkeleton } from "./dashboard-skeleton.component";

test("DashboardSkeleton renders a non-empty placeholder", () => {
  const { container } = render(<DashboardSkeleton />);
  assert.ok(container.firstElementChild);
});
