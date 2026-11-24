/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, test } from "node:test";
import { COPY } from "~/lib/copy/copy.config";
import { STORAGE_API } from "~/lib/storage/storage.config";
import { installFakeApi, type FakeApi } from "~test/fake-api";
import { makeItem } from "~test/fixtures";
import { act, render, screen } from "~test/ui";
import { TerminalList } from "./terminal-list.component";

const active = makeItem({
  id: "a",
  name: "Terminal | Active",
  terminal: { isActive: true, expiresAt: Date.now() + 3 * 86_400_000, isFinalOffer: false },
});
const sealed = makeItem({
  id: "s",
  name: "Terminal | Sealed",
  terminal: { isActive: false, expiresAt: null, isFinalOffer: false },
});
const stored = makeItem({
  id: "z",
  name: "Terminal | Stored",
  locationId: "unit-1",
  terminal: { isActive: false, expiresAt: null, isFinalOffer: false },
});

/** Lets the offer request finish so its state update lands inside the test. */
async function settle(): Promise<void> {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 20));
  });
}

describe("TerminalList", () => {
  let api: FakeApi;
  beforeEach(() => {
    api = installFakeApi();
    api.respond(STORAGE_API.terminalOffer, () => ({
      body: { offers: [], isFinalOffer: false, currency: "USD" },
    }));
  });
  afterEach(() => api.restore());

  test("nothing renders without terminals", () => {
    const { container } = render(<TerminalList terminals={[]} />);
    assert.equal(container.textContent, "");
  });

  test("active and sealed terminals sit under their own headings", async () => {
    render(<TerminalList terminals={[active, sealed]} />);
    await settle();
    assert.ok(screen.getByRole("heading", { name: COPY.terminal.activeHeading }));
    assert.ok(screen.getByRole("heading", { name: COPY.terminal.sealedHeading }));
  });

  test("a sealed terminal in the inventory can be activated", () => {
    render(<TerminalList terminals={[sealed]} />);
    assert.ok(screen.getByRole("button", { name: COPY.terminal.activate }));
    assert.ok(screen.queryByRole("heading", { name: COPY.terminal.activeHeading }) === null);
  });

  test("a sealed terminal in a unit says to move it first", () => {
    render(<TerminalList terminals={[stored]} />);
    assert.ok(screen.getByText(COPY.terminal.inStorage));
    assert.ok(screen.queryByRole("button", { name: COPY.terminal.activate }) === null);
  });

  test("an active terminal shows when it expires", async () => {
    render(<TerminalList terminals={[active]} />);
    assert.ok(screen.getByText(new RegExp(COPY.terminal.expiresIn)));
    await settle();
  });
});
