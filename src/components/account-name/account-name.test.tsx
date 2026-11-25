/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { render, screen } from "~test/ui";
import { AccountName } from "./account-name.component";

test("AccountName shows the name and keeps a passed className", () => {
  render(<AccountName name="Alpha" className="extra" />);
  const node = screen.getByText("Alpha");
  assert.ok(node.classList.contains("extra"));
});
