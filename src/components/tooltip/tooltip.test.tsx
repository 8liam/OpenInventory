/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { act, fireEvent, render, screen, within } from "~test/ui";
import { Tooltip } from "./tooltip.component";
import { TOOLTIP } from "./tooltip.config";

describe("Tooltip", () => {
  const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

  test("keyboard focus shows the bubble with the kind and title, blur hides it", async () => {
    render(
      <Tooltip name="Sticker | Natus Vincere | Katowice 2014" detail="Pattern 5">
        <span>icon</span>
      </Tooltip>,
    );
    const trigger = screen.getByText("icon").parentElement as HTMLElement;
    assert.ok(screen.queryByRole("tooltip") === null);
    await act(async () => {
      fireEvent.focus(trigger);
    });
    const tip = screen.getByRole("tooltip");
    assert.ok(within(tip).getByText("Sticker"));
    assert.ok(within(tip).getByText("Natus Vincere | Katowice 2014"));
    assert.ok(within(tip).getByText("Pattern 5"));
    assert.equal(trigger.getAttribute("aria-describedby"), tip.id);
    await act(async () => {
      fireEvent.blur(trigger);
    });
    assert.ok(screen.queryByRole("tooltip") === null);
  });

  test("hover waits for the delay before showing", async () => {
    render(
      <Tooltip name="Charm | Lil Ava">
        <span>icon</span>
      </Tooltip>,
    );
    const trigger = screen.getByText("icon").parentElement as HTMLElement;
    await act(async () => {
      fireEvent.mouseEnter(trigger);
      await wait(TOOLTIP.showDelayMs / 3);
    });
    assert.ok(screen.queryByRole("tooltip") === null);
    await act(async () => {
      await wait(TOOLTIP.showDelayMs);
    });
    assert.ok(screen.getByRole("tooltip"));
    await act(async () => {
      fireEvent.mouseLeave(trigger);
    });
    assert.ok(screen.queryByRole("tooltip") === null);
  });

  test("leaving before the delay never shows it", async () => {
    render(
      <Tooltip name="Charm | Lil Ava">
        <span>icon</span>
      </Tooltip>,
    );
    const trigger = screen.getByText("icon").parentElement as HTMLElement;
    await act(async () => {
      fireEvent.mouseEnter(trigger);
      fireEvent.mouseLeave(trigger);
      await wait(TOOLTIP.showDelayMs * 1.5);
    });
    assert.ok(screen.queryByRole("tooltip") === null);
  });

  test("Escape dismisses an open tooltip", async () => {
    render(
      <Tooltip name="Patch | Crown">
        <span>icon</span>
      </Tooltip>,
    );
    await act(async () => {
      fireEvent.focus(screen.getByText("icon").parentElement as HTMLElement);
    });
    assert.ok(screen.getByRole("tooltip"));
    await act(async () => {
      fireEvent.keyDown(document, { key: TOOLTIP.closeKey });
    });
    assert.ok(screen.queryByRole("tooltip") === null);
  });

  test("a name without a type has only a title; the image is decorative", async () => {
    render(
      <Tooltip name="Plain" imageUrl="x.png">
        <span>icon</span>
      </Tooltip>,
    );
    await act(async () => {
      fireEvent.focus(screen.getByText("icon").parentElement as HTMLElement);
    });
    const tip = screen.getByRole("tooltip");
    assert.equal(tip.querySelectorAll("p").length, 1);
    assert.equal(tip.querySelector("img")?.getAttribute("alt"), "");
  });
});
