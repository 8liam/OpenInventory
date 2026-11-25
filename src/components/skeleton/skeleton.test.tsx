/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { render } from "~test/ui";
import { Skeleton } from "./skeleton.component";

test("Skeleton renders as a decorative placeholder", () => {
  const { container } = render(<Skeleton className="h-4" />);
  assert.equal(container.textContent, "");
  assert.ok(container.firstElementChild);
});
