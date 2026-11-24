/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { render } from "~test/ui";
import { CasesBodySkeleton, CasesSkeleton } from "./cases-skeleton.component";

test("CasesSkeleton renders the full page and the body-only variant", () => {
  const full = render(<CasesSkeleton />);
  assert.ok(full.container.firstElementChild);
  full.unmount();
  const body = render(<CasesSkeleton onlyBody />);
  assert.ok(body.container.firstElementChild);
  body.unmount();
  const bare = render(<CasesBodySkeleton />);
  assert.ok(bare.container.firstElementChild);
});
