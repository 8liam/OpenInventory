/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { render, screen, setupUser } from "~test/ui";
import { LOAD_ERROR } from "./load-error.config";
import { LoadError } from "./load-error.component";

describe("LoadError", () => {
  test("shows the default title, the message and retries on click", async () => {
    let retries = 0;
    render(<LoadError message="Server down" onRetry={() => void (retries += 1)} />);
    assert.ok(screen.getByRole("alert"));
    assert.ok(screen.getByText(LOAD_ERROR.title));
    assert.ok(screen.getByText("Server down"));
    await setupUser().click(screen.getByRole("button", { name: LOAD_ERROR.retry }));
    assert.equal(retries, 1);
  });

  test("a custom title replaces the default", () => {
    render(<LoadError title="Items failed" message="x" onRetry={() => {}} />);
    assert.ok(screen.getByText("Items failed"));
    assert.ok(screen.queryByText(LOAD_ERROR.title) === null);
  });

  test("while retrying the button stays focusable but ignores presses", async () => {
    let retries = 0;
    render(<LoadError message="x" retrying onRetry={() => void (retries += 1)} />);
    const button = screen.getByRole("button", { name: LOAD_ERROR.retrying });
    assert.equal(button.getAttribute("aria-disabled"), "true");
    assert.equal((button as HTMLButtonElement).disabled, false);
    await setupUser().click(button);
    assert.equal(retries, 0);
  });
});
