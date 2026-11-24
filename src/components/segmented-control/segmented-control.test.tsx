/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { render, screen, setupUser } from "~test/ui";
import { SegmentedControl } from "./segmented-control.component";

const OPTIONS = [
  { id: "a", label: "Alpha" },
  { id: "b", label: "Bravo" },
  { id: "c", label: "Charlie" },
] as const;

describe("SegmentedControl", () => {
  test("is a labelled radio group with the value checked", () => {
    render(<SegmentedControl ariaLabel="Mode" value="b" options={OPTIONS} onChange={() => {}} />);
    assert.ok(screen.getByRole("radiogroup", { name: "Mode" }));
    assert.equal(screen.getByRole("radio", { name: "Bravo" }).getAttribute("aria-checked"), "true");
    assert.equal(screen.getByRole("radio", { name: "Alpha" }).getAttribute("aria-checked"), "false");
  });

  test("only the checked radio is in the tab order", () => {
    render(<SegmentedControl ariaLabel="Mode" value="b" options={OPTIONS} onChange={() => {}} />);
    assert.equal(screen.getByRole("radio", { name: "Bravo" }).getAttribute("tabindex"), "0");
    assert.equal(screen.getByRole("radio", { name: "Alpha" }).getAttribute("tabindex"), "-1");
  });

  test("click selects", async () => {
    const picked: string[] = [];
    render(<SegmentedControl ariaLabel="Mode" value="a" options={OPTIONS} onChange={(id) => picked.push(id)} />);
    await setupUser().click(screen.getByRole("radio", { name: "Charlie" }));
    assert.deepEqual(picked, ["c"]);
  });

  test("arrow keys move the selection and wrap", async () => {
    const picked: string[] = [];
    render(<SegmentedControl ariaLabel="Mode" value="c" options={OPTIONS} onChange={(id) => picked.push(id)} />);
    const user = setupUser();
    screen.getByRole("radio", { name: "Charlie" }).focus();
    await user.keyboard("{ArrowRight}");
    assert.deepEqual(picked, ["a"]);
  });
});
