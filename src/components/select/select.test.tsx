/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { ArrowLeftRight } from "lucide-react";
import { render, screen, setupUser, within } from "~test/ui";
import { Select } from "./select.component";
import { SELECT } from "./select.config";
import type { SelectOption } from "./select.types";

const FEW: readonly SelectOption[] = [
  { id: "a", label: "Alpha", detail: "3" },
  { id: "b", label: "Bravo", hint: "second" },
  { id: "c", label: "Charlie", disabled: true },
];

const MANY: readonly SelectOption[] = Array.from({ length: SELECT.searchThreshold + 3 }, (_, index) => ({
  id: `id-${index}`,
  label: `Option ${index}`,
}));

function mount(options: readonly SelectOption[], value: string, onChange: (id: string) => void = () => {}) {
  return render(<Select ariaLabel="Pick" value={value} options={options} onChange={onChange} />);
}

describe("Select", () => {
  test("the trigger is a collapsed combobox showing the chosen label", () => {
    mount(FEW, "b");
    const trigger = screen.getByRole("combobox", { name: "Pick" });
    assert.equal(trigger.getAttribute("aria-expanded"), "false");
    assert.equal(trigger.getAttribute("aria-haspopup"), "listbox");
    assert.ok(trigger.textContent?.includes("Bravo"));
    assert.ok(screen.queryByRole("listbox") === null);
  });

  test("triggerLabel and triggerDetail show in the trigger, not the list label", () => {
    mount([{ id: "a", label: "Long full name", triggerLabel: "Short", triggerDetail: "…1234" }], "a");
    const trigger = screen.getByRole("combobox");
    assert.ok(trigger.textContent?.includes("Short"));
    assert.ok(trigger.textContent?.includes("…1234"));
    assert.ok(!trigger.textContent?.includes("Long full name"));
  });

  test("clicking opens a listbox of options with the value selected", async () => {
    mount(FEW, "b");
    await setupUser().click(screen.getByRole("combobox"));
    assert.equal(screen.getByRole("combobox").getAttribute("aria-expanded"), "true");
    const options = within(screen.getByRole("listbox", { name: "Pick" })).getAllByRole("option");
    assert.equal(options.length, FEW.length);
    assert.equal(screen.getByRole("option", { name: /Bravo/ }).getAttribute("aria-selected"), "true");
    assert.equal(screen.getByRole("option", { name: /Alpha/ }).getAttribute("aria-selected"), "false");
  });

  test("choosing an option reports it, closes the list and refocuses the trigger", async () => {
    const picked: string[] = [];
    mount(FEW, "a", (id) => picked.push(id));
    const user = setupUser();
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: /Bravo/ }));
    assert.deepEqual(picked, ["b"]);
    assert.ok(screen.queryByRole("listbox") === null);
    assert.equal(document.activeElement, screen.getByRole("combobox"));
  });

  test("a disabled option cannot be chosen", async () => {
    const picked: string[] = [];
    mount(FEW, "a", (id) => picked.push(id));
    const user = setupUser();
    await user.click(screen.getByRole("combobox"));
    const disabled = screen.getByRole("option", { name: /Charlie/ });
    assert.equal(disabled.getAttribute("aria-disabled"), "true");
    await user.click(disabled);
    assert.deepEqual(picked, []);
    assert.ok(screen.getByRole("listbox"));
  });

  test("a disabled select does not open", async () => {
    render(<Select ariaLabel="Pick" value="a" options={FEW} onChange={() => {}} disabled />);
    const trigger = screen.getByRole("combobox") as HTMLButtonElement;
    assert.equal(trigger.disabled, true);
    await setupUser().click(trigger);
    assert.ok(screen.queryByRole("listbox") === null);
  });

  test("arrow keys open the list and move the highlight; Enter commits", async () => {
    const picked: string[] = [];
    mount(FEW, "a", (id) => picked.push(id));
    const user = setupUser();
    screen.getByRole("combobox").focus();
    await user.keyboard("{ArrowDown}");
    assert.ok(screen.getByRole("listbox"));
    await user.keyboard("{ArrowDown}{Enter}");
    assert.deepEqual(picked, ["b"]);
  });

  test("End and Home jump to the last and first option", async () => {
    const picked: string[] = [];
    mount(MANY.slice(0, 5), "id-2", (id) => picked.push(id));
    const user = setupUser();
    await user.click(screen.getByRole("combobox"));
    await user.keyboard("{End}{Enter}");
    assert.deepEqual(picked, ["id-4"]);
    await user.click(screen.getByRole("combobox"));
    await user.keyboard("{Home}{Enter}");
    assert.deepEqual(picked, ["id-4", "id-0"]);
  });

  test("Escape closes without choosing and returns focus to the trigger", async () => {
    const picked: string[] = [];
    mount(FEW, "a", (id) => picked.push(id));
    const user = setupUser();
    await user.click(screen.getByRole("combobox"));
    await user.keyboard("{Escape}");
    assert.ok(screen.queryByRole("listbox") === null);
    assert.deepEqual(picked, []);
    assert.equal(document.activeElement, screen.getByRole("combobox"));
  });

  test("a short list has no search box", async () => {
    mount(FEW, "a");
    await setupUser().click(screen.getByRole("combobox"));
    assert.ok(screen.queryByRole("textbox", { name: SELECT.searchPlaceholder }) === null);
  });

  test("a long list is searchable and filters the options", async () => {
    mount(MANY, "id-0");
    const user = setupUser();
    await user.click(screen.getByRole("combobox"));
    await user.type(screen.getByRole("textbox", { name: SELECT.searchPlaceholder }), "Option 7");
    const shown = screen.getAllByRole("option");
    assert.equal(shown.length, 1);
    assert.ok(shown[0]?.textContent?.includes("Option 7"));
  });

  test("a search with no hits says so", async () => {
    mount(MANY, "id-0");
    const user = setupUser();
    await user.click(screen.getByRole("combobox"));
    await user.type(screen.getByRole("textbox", { name: SELECT.searchPlaceholder }), "zzz");
    assert.ok(screen.getByText(SELECT.noMatches));
    assert.equal(screen.queryAllByRole("option").length, 0);
  });

  test("iconTrigger renders an icon-only button named by ariaLabel", () => {
    render(<Select ariaLabel="Switch" value="a" options={FEW} onChange={() => {}} iconTrigger={ArrowLeftRight} />);
    const trigger = screen.getByRole("combobox", { name: "Switch" });
    assert.ok(!trigger.textContent?.includes("Alpha"));
  });

  test("describedBy is wired to the trigger", () => {
    render(
      <>
        <span id="note">extra</span>
        <Select ariaLabel="Pick" value="a" options={FEW} onChange={() => {}} describedBy="note" />
      </>,
    );
    assert.equal(screen.getByRole("combobox").getAttribute("aria-describedby"), "note");
  });
});
