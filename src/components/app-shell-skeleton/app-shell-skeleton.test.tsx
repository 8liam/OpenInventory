/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { render } from "~test/ui";
import { AppShellSkeleton } from "./app-shell-skeleton.component";

test("AppShellSkeleton renders a non-empty placeholder", () => {
  const { container } = render(<AppShellSkeleton />);
  assert.ok(container.firstElementChild);
});
