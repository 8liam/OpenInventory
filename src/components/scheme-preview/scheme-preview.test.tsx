/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { PALETTE_LIST } from "~/lib/theme/palettes.config";
import { render } from "~test/ui";
import { SchemePreview } from "./scheme-preview.component";

const PALETTE = PALETTE_LIST[0];
if (!PALETTE) throw new Error("no palette");

test("SchemePreview is a decorative mock-up in every mode", () => {
  for (const mode of ["light", "dark", "split"] as const) {
    const { container, unmount } = render(
      <SchemePreview mode={mode} variants={{ light: PALETTE.light, dark: PALETTE.dark }} />,
    );
    assert.equal(container.firstElementChild?.getAttribute("aria-hidden"), "true");
    assert.equal(container.textContent, "");
    unmount();
  }
});
