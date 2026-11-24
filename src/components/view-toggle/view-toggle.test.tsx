/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { render, screen, setupUser } from "~test/ui";
import { VIEW_TOGGLE } from "./view-toggle.config";
import { ViewToggle } from "./view-toggle.component";

describe("ViewToggle", () => {
  test("is a labelled group with the current mode pressed", () => {
    render(<ViewToggle value="grid" onChange={() => {}} />);
    assert.ok(screen.getByRole("group", { name: VIEW_TOGGLE.groupLabel }));
    for (const option of VIEW_TOGGLE.options) {
      const button = screen.getByRole("button", { name: option.label });
      assert.equal(button.getAttribute("aria-pressed"), String(option.id === "grid"));
    }
  });

  test("choosing a mode reports it", async () => {
    const picked: string[] = [];
    render(<ViewToggle value="grid" onChange={(mode) => picked.push(mode)} />);
    await setupUser().click(screen.getByRole("button", { name: "List" }));
    assert.deepEqual(picked, ["list"]);
  });
});
