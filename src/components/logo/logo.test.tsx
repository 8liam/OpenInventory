/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { render, screen } from "~test/ui";
import { LOGO } from "./logo.config";
import { Logo, LogoMark } from "./logo.component";

test("Logo shows the product name and hides the mark from assistive tech", () => {
  const { container } = render(<Logo />);
  assert.ok(screen.getByText(LOGO.name));
  assert.equal(container.querySelector("svg")?.getAttribute("aria-hidden"), "true");
});

test("LogoMark renders an svg alone", () => {
  const { container } = render(<LogoMark />);
  assert.ok(container.querySelector("svg"));
  assert.equal(container.textContent, "");
});
