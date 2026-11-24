/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { PALETTE_LIST } from "~/lib/theme/palettes.config";
import { render } from "~test/ui";
import { Flashbang } from "./flashbang.component";

const PALETTE = PALETTE_LIST[0];
if (!PALETTE) throw new Error("no palette");

test("Flashbang renders a decorative svg for a theme variant", () => {
  const { container } = render(<Flashbang variant={PALETTE.light} angle={8} />);
  const svg = container.querySelector("svg");
  assert.ok(svg);
  assert.equal(svg.getAttribute("aria-hidden"), "true");
});
