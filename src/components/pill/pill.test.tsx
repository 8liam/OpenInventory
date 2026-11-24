/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { render, screen, setupUser } from "~test/ui";
import { Pill } from "./pill.component";

describe("Pill", () => {
  test("reports its pressed state", () => {
    const { rerender } = render(<Pill active={false} onClick={() => {}}>Rifles</Pill>);
    assert.equal(screen.getByRole("button", { name: "Rifles" }).getAttribute("aria-pressed"), "false");
    rerender(<Pill active onClick={() => {}}>Rifles</Pill>);
    assert.equal(screen.getByRole("button", { name: "Rifles" }).getAttribute("aria-pressed"), "true");
  });

  test("click calls onClick", async () => {
    let clicks = 0;
    render(<Pill active={false} onClick={() => void (clicks += 1)}>A</Pill>);
    await setupUser().click(screen.getByRole("button", { name: "A" }));
    assert.equal(clicks, 1);
  });

  test("disabled ignores clicks", async () => {
    let clicks = 0;
    render(<Pill active={false} disabled onClick={() => void (clicks += 1)}>A</Pill>);
    await setupUser().click(screen.getByRole("button", { name: "A" }));
    assert.equal(clicks, 0);
  });
});
