/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, test } from "node:test";
import { COPY } from "~/lib/copy/copy.config";
import { AUTH_STATUS, STORAGE_API } from "~/lib/storage/storage.config";
import type { AuthState } from "~/lib/storage/storage.types";
import { installFakeApi, type FakeApi } from "~test/fake-api";
import { render, screen, setupUser, waitFor } from "~test/ui";
import { LoginCard } from "./login-card.component";

const BUTTON = "Show it";

function card(login: AuthState, extra: { headingLevel?: 1 | 2 } = {}) {
  return <LoginCard login={login} title="Title" body="Body text" buttonLabel={BUTTON} {...extra} />;
}

describe("LoginCard", () => {
  let api: FakeApi;
  beforeEach(() => {
    api = installFakeApi();
  });
  afterEach(() => api.restore());

  test("signed out: shows title, body and the start button", () => {
    render(card({ status: AUTH_STATUS.signedOut }));
    assert.ok(screen.getByRole("heading", { name: "Title" }));
    assert.ok(screen.getByText("Body text"));
    assert.ok(screen.getByRole("button", { name: BUTTON }));
  });

  test("headingLevel 1 renders an h1, default an h2", () => {
    const { unmount } = render(card({ status: AUTH_STATUS.signedOut }, { headingLevel: 1 }));
    assert.ok(screen.getByRole("heading", { level: 1, name: "Title" }));
    unmount();
    render(card({ status: AUTH_STATUS.signedOut }));
    assert.ok(screen.getByRole("heading", { level: 2, name: "Title" }));
  });

  test("the start button posts to the login endpoint", async () => {
    render(card({ status: AUTH_STATUS.signedOut }));
    await setupUser().click(screen.getByRole("button", { name: BUTTON }));
    await waitFor(() => assert.equal(api.calls[0]?.path, STORAGE_API.accountLogin));
  });

  test("a failed start shows the error as an alert", async () => {
    api.respond(STORAGE_API.accountLogin, () => ({ status: 500, body: { error: "no steam" } }));
    render(card({ status: AUTH_STATUS.signedOut }));
    await setupUser().click(screen.getByRole("button", { name: BUTTON }));
    assert.equal((await screen.findByRole("alert")).textContent, "no steam");
  });

  test("qr pending: shows the QR image and the waiting hint, no start button", () => {
    render(card({ status: AUTH_STATUS.qrPending, qrSvg: "<svg></svg>" }));
    assert.ok(screen.getByRole("img", { name: COPY.signIn.qrLabel }));
    assert.ok(screen.getByText(COPY.signIn.waiting));
    assert.ok(screen.queryByRole("button") === null);
  });

  test("connecting: shows the detail", () => {
    render(card({ status: AUTH_STATUS.connecting, detail: "Logging in" }));
    assert.ok(screen.getByText("Logging in"));
    assert.ok(screen.queryByRole("button") === null);
  });

  test("error: shows the message and offers Show a new QR code", () => {
    render(card({ status: AUTH_STATUS.error, message: "Expired" }));
    assert.equal(screen.getByRole("alert").textContent, "Expired");
    assert.ok(screen.getByRole("button", { name: COPY.accounts.tryAgain }));
  });
});
