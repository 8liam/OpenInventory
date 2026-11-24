/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { COPY } from "~/lib/copy/copy.config";
import { render, screen } from "~test/ui";
import { UpdatedHeader } from "./updated-header.component";

describe("UpdatedHeader", () => {
  test("without an update time it names only the source", () => {
    render(<UpdatedHeader title="Dashboard" priceUpdatedAt={null} source="Steam" />);
    assert.ok(screen.getByRole("heading", { name: "Dashboard" }));
    assert.ok(screen.getByText(COPY.dashboard.pricesFrom("Steam")));
  });

  test("with an update time it says when, from which source", () => {
    render(
      <UpdatedHeader title="Dashboard" priceUpdatedAt={Date.now() - 3 * 60_000} source="Steam" />,
    );
    assert.ok(screen.getByText(/Prices updated .* from Steam/));
  });

  test("shows the account chip and children", () => {
    render(
      <UpdatedHeader title="Dashboard" priceUpdatedAt={null} source="Steam" account="Alpha">
        <button type="button">Refresh</button>
      </UpdatedHeader>,
    );
    assert.ok(screen.getByRole("button", { name: "Refresh" }));
    assert.ok(screen.getByText(/Alpha/));
  });
});
