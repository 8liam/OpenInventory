/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { render, screen } from "~test/ui";
import { ChipRow } from "./chip-row.component";

test("ChipRow renders every child", () => {
  render(
    <ChipRow>
      <span>one</span>
      <span>two</span>
    </ChipRow>,
  );
  assert.ok(screen.getByText("one"));
  assert.ok(screen.getByText("two"));
});
