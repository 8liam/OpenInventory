/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { act, render, screen, setupUser, waitFor } from "~test/ui";
import { DangerDialog } from "./danger-dialog.component";
import type { DangerDialogProps } from "./danger-dialog.types";

const LABELS = {
  title: "Remove thing?",
  warning: "This cannot be undone.",
  effects: ["First effect", "Second effect"],
  acknowledgement: "I understand",
  confirmLabel: "Remove",
  workingLabel: "Removing",
  cancelLabel: "Back",
} as const;

function props(overrides: Partial<DangerDialogProps> = {}): DangerDialogProps {
  return {
    open: true,
    ...LABELS,
    onConfirm: async () => {},
    onClose: () => {},
    ...overrides,
  };
}

describe("DangerDialog", () => {
  test("opens as a labelled modal dialog listing each effect", () => {
    render(<DangerDialog {...props()} />);
    const dialog = screen.getByRole("dialog", { name: LABELS.title });
    assert.equal(dialog.hasAttribute("open"), true);
    for (const effect of LABELS.effects) assert.ok(screen.getByText(effect));
    assert.ok(screen.getByText(LABELS.warning));
  });

  test("stays closed while open is false", () => {
    render(<DangerDialog {...props({ open: false })} />);
    assert.ok(screen.queryByRole("dialog") === null);
  });

  test("confirm is disabled until the acknowledgement is ticked", async () => {
    let confirmed = 0;
    render(<DangerDialog {...props({ onConfirm: async () => void (confirmed += 1) })} />);
    const confirm = screen.getByRole("button", { name: LABELS.confirmLabel });
    assert.equal((confirm as HTMLButtonElement).disabled, true);
    await setupUser().click(screen.getByRole("checkbox", { name: LABELS.acknowledgement }));
    assert.equal((confirm as HTMLButtonElement).disabled, false);
    await setupUser().click(confirm);
    await waitFor(() => assert.equal(confirmed, 1));
  });

  test("a failed confirm shows the error and keeps the dialog open", async () => {
    render(
      <DangerDialog
        {...props({
          onConfirm: async () => {
            throw new Error("nope");
          },
        })}
      />,
    );
    const user = setupUser();
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: LABELS.confirmLabel }));
    assert.equal((await screen.findByRole("alert")).textContent, "nope");
    assert.ok(screen.getByRole("dialog"));
  });

  test("shows the working label and ignores a second confirm while pending", async () => {
    let release: () => void = () => {};
    let calls = 0;
    const pending = new Promise<void>((resolve) => (release = resolve));
    render(
      <DangerDialog
        {...props({
          onConfirm: async () => {
            calls += 1;
            await pending;
          },
        })}
      />,
    );
    const user = setupUser();
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: LABELS.confirmLabel }));
    const busy = await screen.findByRole("button", { name: LABELS.workingLabel });
    await user.click(busy);
    assert.equal(calls, 1);
    await act(async () => {
      release();
      await pending;
    });
  });

  test("Cancel closes the dialog and reports onClose", async () => {
    let closed = 0;
    render(<DangerDialog {...props({ onClose: () => void (closed += 1) })} />);
    await setupUser().click(screen.getByRole("button", { name: LABELS.cancelLabel }));
    await waitFor(() => assert.equal(closed, 1));
  });
});
