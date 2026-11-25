/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { COPY } from "~/lib/copy/copy.config";
import { AUTH_STATUS } from "~/lib/storage/storage.config";
import { render, screen } from "~test/ui";
import { SignInScreen } from "./sign-in-screen.component";

test("SignInScreen shows the page heading, start button and footnote", () => {
  render(<SignInScreen login={{ status: AUTH_STATUS.signedOut }} />);
  assert.ok(screen.getByRole("heading", { level: 1, name: COPY.signIn.title }));
  assert.ok(screen.getByRole("button", { name: COPY.signIn.button }));
  assert.ok(screen.getByText(COPY.signIn.footnote));
});
