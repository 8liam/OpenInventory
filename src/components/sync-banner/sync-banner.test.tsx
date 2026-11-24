/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { COPY } from "~/lib/copy/copy.config";
import { render, screen, setupUser } from "~test/ui";
import { SyncBanner } from "./sync-banner.component";
import type { SyncBannerProps } from "./sync-banner.types";

const copy = COPY.cases;
type Sync = SyncBannerProps["sync"];

function sync(overrides: Record<string, unknown>): Sync {
  return {
    state: "idle",
    pages: 0,
    events: 0,
    lastSyncAt: null,
    complete: true,
    message: "",
    ...overrides,
  } as unknown as Sync;
}

function props(overrides: Partial<SyncBannerProps> = {}): SyncBannerProps {
  return { sync: sync({}), onSync: () => {}, requestPending: false, requestError: null, ...overrides };
}

describe("SyncBanner", () => {
  test("first run shows the hint and a Sync button that fires onSync", async () => {
    let syncs = 0;
    render(<SyncBanner {...props({ onSync: () => void (syncs += 1) })} />);
    assert.ok(screen.getByText(copy.firstSyncHint));
    await setupUser().click(screen.getByRole("button", { name: copy.sync }));
    assert.equal(syncs, 1);
  });

  test("while running it shows progress and ignores presses", async () => {
    let syncs = 0;
    render(
      <SyncBanner
        {...props({ sync: sync({ state: "running", pages: 3, events: 12 }), onSync: () => void (syncs += 1) })}
      />,
    );
    const button = screen.getByRole("button", { name: copy.syncing });
    assert.equal(button.getAttribute("aria-disabled"), "true");
    await setupUser().click(button);
    assert.equal(syncs, 0);
    assert.equal(screen.getByRole("status").textContent, copy.syncStarted);
    assert.ok(screen.getByText(/3/));
    assert.ok(screen.getByText(/12/));
  });

  test("a pending request counts as busy", () => {
    render(<SyncBanner {...props({ requestPending: true })} />);
    assert.ok(screen.getByRole("button", { name: copy.syncing }));
  });

  test("an errored sync shows its message as an alert", () => {
    render(<SyncBanner {...props({ sync: sync({ state: "error", message: "Steam said no" }) })} />);
    assert.equal(screen.getByRole("alert").textContent, "Steam said no");
  });

  test("a request error shows as an alert", () => {
    render(<SyncBanner {...props({ requestError: "network" })} />);
    assert.equal(screen.getByRole("alert").textContent, "network");
  });

  test("after a sync it shows when, and warns when the history is partial", () => {
    render(
      <SyncBanner {...props({ sync: sync({ lastSyncAt: Date.UTC(2026, 0, 2), complete: false }) })} />,
    );
    assert.ok(screen.getByText(new RegExp(copy.lastSync)));
    assert.ok(screen.getByText(copy.partial));
    assert.ok(screen.queryByText(copy.firstSyncHint) === null);
  });
});
