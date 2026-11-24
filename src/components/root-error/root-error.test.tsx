/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { render, screen } from "~test/ui";
import { ROOT_ERROR } from "./root-error.config";
import { RootError } from "./root-error.component";

describe("RootError", () => {
  test("is a labelled main landmark with a reload button", () => {
    render(<RootError error={new Error("kaput")} />);
    assert.ok(screen.getByRole("main", { name: ROOT_ERROR.title }));
    assert.ok(screen.getByRole("button", { name: ROOT_ERROR.reload }));
  });

  test("shows the message of an Error", () => {
    render(<RootError error={new Error("kaput")} />);
    assert.ok(screen.getByText("kaput"));
  });

  test("shows a thrown string", () => {
    render(<RootError error="plain text" />);
    assert.ok(screen.getByText("plain text"));
  });

  test("shows no detail for other thrown values", () => {
    const { container } = render(<RootError error={{ code: 1 }} />);
    assert.ok(!container.textContent?.includes("[object"));
    assert.ok(screen.getByText(ROOT_ERROR.body));
  });
});
