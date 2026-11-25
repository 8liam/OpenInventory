/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { Inbox } from "lucide-react";
import { render, screen } from "~test/ui";
import { EmptyState } from "./empty-state.component";

test("EmptyState shows the headline and the reason", () => {
  render(<EmptyState icon={Inbox} title="Nothing here" body="Try later" />);
  assert.ok(screen.getByText("Nothing here"));
  assert.ok(screen.getByText("Try later"));
});
