/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, test } from "node:test";
import { clearStale, markStale, setStreamState } from "~/lib/storage/stale-data.store";
import { installFakeApi, type FakeApi } from "~test/fake-api";
import { act, render, screen, setupUser } from "~test/ui";
import { STALE_BANNER } from "./stale-banner.config";
import { StaleBanner } from "./stale-banner.component";

describe("StaleBanner", () => {
  let api: FakeApi;
  const key = Symbol("test-load");
  beforeEach(() => {
    api = installFakeApi();
  });
  afterEach(async () => {
    await act(async () => {
      clearStale(key);
      setStreamState(false, null);
    });
    api.restore();
  });

  test("shows nothing while the data is fresh", () => {
    render(<StaleBanner />);
    assert.ok(screen.queryByRole("button", { name: STALE_BANNER.retry }) === null);
    assert.equal(screen.getByRole("status").textContent, "");
  });

  test("a dropped stream says it is reconnecting and announces it", async () => {
    render(<StaleBanner />);
    await act(async () => setStreamState(true, Date.now() - 60_000));
    assert.equal(screen.getByRole("status").textContent, STALE_BANNER.reconnecting);
    assert.ok(screen.getByRole("button", { name: STALE_BANNER.retry }));
  });

  test("a failed refresh says so and Retry refreshes it", async () => {
    let refreshed = 0;
    render(<StaleBanner />);
    await act(async () =>
      markStale(key, { message: "x", lastSuccessAt: Date.now() - 1000, refresh: () => void (refreshed += 1) }),
    );
    assert.equal(screen.getByRole("status").textContent, STALE_BANNER.refreshFailed);
    await setupUser().click(screen.getByRole("button", { name: STALE_BANNER.retry }));
    assert.equal(refreshed, 1);
  });

  test("goes away once the load is fresh again", async () => {
    render(<StaleBanner />);
    await act(async () => markStale(key, { message: "x", lastSuccessAt: 1, refresh: () => {} }));
    assert.ok(screen.getByRole("button", { name: STALE_BANNER.retry }));
    await act(async () => clearStale(key));
    assert.ok(screen.queryByRole("button", { name: STALE_BANNER.retry }) === null);
  });
});
