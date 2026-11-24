/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { COPY } from "~/lib/copy/copy.config";
import { render, screen } from "~test/ui";
import { LoadingRegion } from "./loading-region.component";

test("LoadingRegion is a busy status that says Loading once", () => {
  render(
    <LoadingRegion>
      <span>placeholder</span>
    </LoadingRegion>,
  );
  const region = screen.getByRole("status");
  assert.equal(region.getAttribute("aria-busy"), "true");
  assert.ok(screen.getByText(COPY.common.loading));
  assert.ok(screen.getByText("placeholder"));
});
