/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { render, screen, setupUser } from "~test/ui";
import { Button } from "./button.component";

describe("Button", () => {
  test("renders a type=button by default and fires onClick", async () => {
    let clicks = 0;
    render(<Button onClick={() => (clicks += 1)}>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    assert.equal(button.getAttribute("type"), "button");
    await setupUser().click(button);
    assert.equal(clicks, 1);
  });

  test("a disabled button ignores clicks", async () => {
    let clicks = 0;
    render(
      <Button disabled onClick={() => (clicks += 1)}>
        Save
      </Button>,
    );
    await setupUser().click(screen.getByRole("button", { name: "Save" }));
    assert.equal(clicks, 0);
  });

  test("type can be overridden to submit", () => {
    render(<Button type="submit">Go</Button>);
    assert.equal(screen.getByRole("button", { name: "Go" }).getAttribute("type"), "submit");
  });
});
