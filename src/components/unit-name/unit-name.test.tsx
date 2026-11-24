/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { render, screen, setupUser, waitFor } from "~test/ui";
import { UnitName } from "./unit-name.component";
import { UNIT_NAME } from "./unit-name.config";

describe("UnitName", () => {
  test("shows the name and an edit button", () => {
    render(<UnitName name="Unit A" onRename={async () => {}} />);
    assert.ok(screen.getByText("Unit A"));
    assert.ok(screen.getByRole("button", { name: UNIT_NAME.editLabel }));
  });

  test("editing starts with the current name; saving sends the trimmed new name", async () => {
    const renamed: string[] = [];
    render(<UnitName name="Unit A" onRename={async (name) => void renamed.push(name)} />);
    const user = setupUser();
    await user.click(screen.getByRole("button", { name: UNIT_NAME.editLabel }));
    const input = screen.getByRole("textbox", { name: UNIT_NAME.inputLabel }) as HTMLInputElement;
    assert.equal(input.value, "Unit A");
    await user.clear(input);
    await user.type(input, "  Skins  ");
    await user.click(screen.getByRole("button", { name: UNIT_NAME.saveLabel }));
    await waitFor(() => assert.deepEqual(renamed, ["Skins"]));
    await waitFor(() => assert.ok(screen.queryByRole("textbox") === null));
  });

  test("Enter saves", async () => {
    const renamed: string[] = [];
    render(<UnitName name="Unit A" onRename={async (name) => void renamed.push(name)} />);
    const user = setupUser();
    await user.click(screen.getByRole("button", { name: UNIT_NAME.editLabel }));
    await user.type(screen.getByRole("textbox"), "2{Enter}");
    await waitFor(() => assert.deepEqual(renamed, ["Unit A2"]));
  });

  test("an unchanged or empty name just closes", async () => {
    const renamed: string[] = [];
    render(<UnitName name="Unit A" onRename={async (name) => void renamed.push(name)} />);
    const user = setupUser();
    await user.click(screen.getByRole("button", { name: UNIT_NAME.editLabel }));
    await user.click(screen.getByRole("button", { name: UNIT_NAME.saveLabel }));
    assert.deepEqual(renamed, []);
    await user.click(screen.getByRole("button", { name: UNIT_NAME.editLabel }));
    await user.clear(screen.getByRole("textbox"));
    await user.click(screen.getByRole("button", { name: UNIT_NAME.saveLabel }));
    assert.deepEqual(renamed, []);
    assert.ok(screen.queryByRole("textbox") === null);
  });

  test("Escape and Cancel discard the edit", async () => {
    render(<UnitName name="Unit A" onRename={async () => {}} />);
    const user = setupUser();
    await user.click(screen.getByRole("button", { name: UNIT_NAME.editLabel }));
    await user.type(screen.getByRole("textbox"), "x");
    await user.keyboard("{Escape}");
    assert.ok(screen.getByText("Unit A"));
    await user.click(screen.getByRole("button", { name: UNIT_NAME.editLabel }));
    await user.click(screen.getByRole("button", { name: UNIT_NAME.cancelLabel }));
    assert.ok(screen.getByText("Unit A"));
  });

  test("a failed rename keeps the editor open with the error", async () => {
    render(
      <UnitName
        name="Unit A"
        onRename={async () => {
          throw new Error("name taken");
        }}
      />,
    );
    const user = setupUser();
    await user.click(screen.getByRole("button", { name: UNIT_NAME.editLabel }));
    await user.type(screen.getByRole("textbox"), "b");
    await user.click(screen.getByRole("button", { name: UNIT_NAME.saveLabel }));
    assert.equal((await screen.findByRole("alert")).textContent, "name taken");
    assert.ok(screen.getByRole("textbox"));
  });
});
