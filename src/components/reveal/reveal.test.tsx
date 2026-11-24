/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, mock, test } from "node:test";
import { act, render, screen } from "~test/ui";
import { Reveal } from "./reveal.component";
import { REVEAL } from "./reveal.config";

describe("Reveal", () => {
  beforeEach(() => {
    mock.timers.enable({ apis: ["setTimeout"] });
  });
  afterEach(() => {
    mock.timers.reset();
  });

  test("open shows its content", () => {
    render(<Reveal open>hello</Reveal>);
    assert.ok(screen.getByText("hello"));
  });

  test("closed from the start renders no content", () => {
    render(<Reveal open={false}>hello</Reveal>);
    assert.ok(screen.queryByText("hello") === null);
  });

  test("closing keeps the content until the transition is over, then removes it", async () => {
    const { rerender, container } = render(<Reveal open>hello</Reveal>);
    rerender(<Reveal open={false}>hello</Reveal>);
    assert.ok(screen.getByText("hello"));
    const wrapper = container.firstElementChild as HTMLElement;
    assert.equal(wrapper.getAttribute("aria-hidden"), "true");
    assert.equal(wrapper.hasAttribute("inert"), true);
    await act(async () => {
      mock.timers.tick(REVEAL.durationMs);
    });
    assert.ok(screen.queryByText("hello") === null);
  });

  test("reopening brings the content back", () => {
    const { rerender } = render(<Reveal open={false}>hello</Reveal>);
    rerender(<Reveal open>hello</Reveal>);
    assert.ok(screen.getByText("hello"));
  });
});
