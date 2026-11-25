/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { Cog, Palette } from "lucide-react";
import { render, screen, setupUser } from "~test/ui";
import { SettingsNav } from "./settings-nav.component";

const ITEMS = [
  { id: "general", label: "General", icon: Cog },
  { id: "look", label: "Look", icon: Palette },
] as const;

test("SettingsNav marks the current page with aria-current", () => {
  render(<SettingsNav ariaLabel="Settings" items={ITEMS} value="look" onChange={() => {}} />);
  assert.ok(screen.getByRole("navigation", { name: "Settings" }));
  assert.equal(screen.getByRole("button", { name: "Look" }).getAttribute("aria-current"), "page");
  assert.equal(screen.getByRole("button", { name: "General" }).getAttribute("aria-current"), null);
});

test("SettingsNav reports the chosen category", async () => {
  const picked: string[] = [];
  render(
    <SettingsNav
      ariaLabel="Settings"
      items={ITEMS}
      value="look"
      onChange={(id) => picked.push(id)}
    />,
  );
  await setupUser().click(screen.getByRole("button", { name: "General" }));
  assert.deepEqual(picked, ["general"]);
});
