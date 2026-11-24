/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { render, screen } from "~test/ui";
import { Panel } from "./panel.component";

describe("Panel", () => {
  test("a titled panel is a section with an h2 and its action", () => {
    render(
      <Panel title="History" action={<button type="button">More</button>}>
        body
      </Panel>,
    );
    assert.ok(screen.getByRole("heading", { level: 2, name: "History" }));
    assert.ok(screen.getByRole("button", { name: "More" }));
    assert.ok(screen.getByText("body"));
  });

  test("without a title there is no heading", () => {
    render(<Panel>just body</Panel>);
    assert.ok(screen.queryByRole("heading") === null);
    assert.ok(screen.getByText("just body"));
  });
});
