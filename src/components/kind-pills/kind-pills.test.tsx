/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { OPENING_KINDS } from "~/lib/cases/cases.config";
import { COPY } from "~/lib/copy/copy.config";
import { render, screen, setupUser } from "~test/ui";
import { KindPills } from "./kind-pills.component";

const COUNTS = { case: 5, souvenir: 1200, capsule: 0, tradeUp: 2, drop: 3 } as const;

describe("KindPills", () => {
  test("one pill per kind, the selected one pressed, with its count", () => {
    render(<KindPills selected="souvenir" counts={COUNTS} onSelect={() => {}} />);
    assert.equal(screen.getAllByRole("button").length, OPENING_KINDS.length);
    const selected = screen.getByRole("button", { name: new RegExp(COPY.cases.kinds.souvenir.pill) });
    assert.equal(selected.getAttribute("aria-pressed"), "true");
    assert.ok(selected.textContent?.includes("1,200"));
  });

  test("clicking a pill selects that kind", async () => {
    const picked: string[] = [];
    render(<KindPills selected="case" counts={COUNTS} onSelect={(kind) => picked.push(kind)} />);
    await setupUser().click(screen.getByRole("button", { name: new RegExp(COPY.cases.kinds.drop.pill) }));
    assert.deepEqual(picked, ["drop"]);
  });

  test("while counts are loading the pills are disabled", () => {
    render(<KindPills selected="case" onSelect={() => {}} />);
    for (const button of screen.getAllByRole("button")) assert.equal((button as HTMLButtonElement).disabled, true);
  });
});
