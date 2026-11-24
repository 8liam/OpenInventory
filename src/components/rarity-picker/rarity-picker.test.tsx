/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { render, screen, setupUser } from "~test/ui";
import { RarityPicker } from "./rarity-picker.component";

const OPTIONS = [
  { id: "a", label: "Consumer", color: "#999" },
  { id: "b", label: "Industrial", color: "#59f" },
  { id: "c", label: "Mil-spec", color: "#35f" },
] as const;

describe("RarityPicker", () => {
  test("one radio per rarity with the value checked and in the tab order", () => {
    render(<RarityPicker label="Rarity" options={OPTIONS} value="b" onChange={() => {}} />);
    const radios = screen.getAllByRole("radio");
    assert.equal(radios.length, 3);
    assert.equal(screen.getByRole("radio", { name: "Industrial" }).getAttribute("aria-checked"), "true");
    assert.equal(screen.getByRole("radio", { name: "Industrial" }).getAttribute("tabindex"), "0");
    assert.equal(screen.getByRole("radio", { name: "Consumer" }).getAttribute("tabindex"), "-1");
  });

  test("click selects", async () => {
    const picked: string[] = [];
    render(<RarityPicker label="Rarity" options={OPTIONS} value="a" onChange={(id) => picked.push(id)} />);
    await setupUser().click(screen.getByRole("radio", { name: "Mil-spec" }));
    assert.deepEqual(picked, ["c"]);
  });

  test("arrow keys move and wrap the selection", async () => {
    const picked: string[] = [];
    render(<RarityPicker label="Rarity" options={OPTIONS} value="c" onChange={(id) => picked.push(id)} />);
    const user = setupUser();
    screen.getByRole("radio", { name: "Mil-spec" }).focus();
    await user.keyboard("{ArrowRight}");
    assert.deepEqual(picked, ["a"]);
  });

  test("the chosen rarity's name is shown", () => {
    render(<RarityPicker label="Rarity" options={OPTIONS} value="b" onChange={() => {}} />);
    assert.ok(screen.getAllByText("Industrial").length >= 1);
  });
});
