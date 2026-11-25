/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { authStatusText } from "~/lib/accounts/account-status";
import { AUTH_STATUS } from "~/lib/storage/storage.config";
import { render, screen } from "~test/ui";
import { AccountStatusDot } from "./account-status-dot.component";

describe("AccountStatusDot", () => {
  test("pairs the dot with the status as text", () => {
    render(<AccountStatusDot status={AUTH_STATUS.error} />);
    assert.ok(screen.getByText(authStatusText(AUTH_STATUS.error)));
  });

  test("custom text replaces the default status text", () => {
    render(<AccountStatusDot status={AUTH_STATUS.ready} text="3 accounts" />);
    assert.ok(screen.getByText("3 accounts"));
    assert.ok(screen.queryByText(authStatusText(AUTH_STATUS.ready)) === null);
  });

  test("decorative drops the text entirely", () => {
    const { container } = render(<AccountStatusDot status={AUTH_STATUS.ready} decorative />);
    assert.equal(container.textContent, "");
  });

  test("each status reads its own text", () => {
    for (const status of Object.values(AUTH_STATUS)) {
      const { unmount } = render(<AccountStatusDot status={status} showText />);
      assert.ok(screen.getByText(authStatusText(status)));
      unmount();
    }
  });
});
