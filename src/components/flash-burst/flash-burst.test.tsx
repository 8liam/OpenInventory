/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { PALETTE_LIST } from "~/lib/theme/palettes.config";
import { render } from "~test/ui";
import { FlashBurst } from "./flash-burst.component";

const PALETTE = PALETTE_LIST[0];
if (!PALETTE) throw new Error("no palette");

test("FlashBurst renders a decorative svg for a theme variant", () => {
  const { container } = render(<FlashBurst variant={PALETTE.dark} />);
  const svg = container.querySelector("svg");
  assert.ok(svg);
  assert.equal(svg.getAttribute("aria-hidden"), "true");
});
