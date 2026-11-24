/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, test } from "node:test";
import { useAccountSelection } from "~/lib/accounts/account-scope.store";
import { COPY } from "~/lib/copy/copy.config";
import { accountState, appSnapshot, installFakeApi, STEAM_ID_A, type FakeApi } from "~test/fake-api";
import { renderWithRouter } from "~test/router";
import { screen, setupUser } from "~test/ui";
import { AppShell } from "./app-shell.component";
import { APP_SHELL, NAV_ITEMS } from "./app-shell.config";

describe("AppShell", () => {
  let api: FakeApi;
  beforeEach(() => {
    api = installFakeApi();
    useAccountSelection.setState({ selected: STEAM_ID_A });
  });
  afterEach(() => api.restore());

  test("with an account it shows a main landmark and a skip link", async () => {
    await renderWithRouter(<AppShell />);
    await api.push(appSnapshot([accountState(STEAM_ID_A)]));
    assert.ok(screen.getByRole("main"));
    assert.ok(screen.getByRole("link", { name: APP_SHELL.skipLink }));
  });

  test("the skip link moves focus to the main region", async () => {
    await renderWithRouter(<AppShell />);
    await api.push(appSnapshot([accountState(STEAM_ID_A)]));
    await setupUser().click(screen.getByRole("link", { name: APP_SHELL.skipLink }));
    assert.equal(document.activeElement, screen.getByRole("main"));
  });

  test("both navs link to every page", async () => {
    await renderWithRouter(<AppShell />);
    await api.push(appSnapshot([accountState(STEAM_ID_A)]));
    for (const { to, key } of NAV_ITEMS) {
      const links = screen.getAllByRole("link", { name: COPY.nav[key] });
      assert.ok(links.length >= 1);
      assert.ok(links.every((link) => link.getAttribute("href") === to));
    }
  });

  test("the current page's link is marked active", async () => {
    await renderWithRouter(<AppShell />, "/items");
    await api.push(appSnapshot([accountState(STEAM_ID_A)]));
    const items = screen.getAllByRole("link", { name: COPY.nav.items });
    assert.ok(items.every((link) => link.getAttribute("data-status") === "active"));
    const settings = screen.getAllByRole("link", { name: COPY.nav.settings });
    assert.ok(settings.every((link) => link.getAttribute("data-status") !== "active"));
  });

  test("with no account it shows sign-in instead of the app", async () => {
    await renderWithRouter(<AppShell />);
    await api.push(appSnapshot([]));
    assert.ok(screen.getByRole("heading", { name: COPY.signIn.title }));
    assert.ok(screen.queryByRole("main") === null);
  });
});
