/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { render, screen } from "~test/ui";
import { PAGE_HEADER } from "./page-header.config";
import { PageHeader } from "./page-header.component";

describe("PageHeader", () => {
  test("renders the title as the page's h1, programmatically focusable", () => {
    render(<PageHeader title="Items" />);
    const heading = screen.getByRole("heading", { level: 1, name: "Items" });
    assert.equal(heading.id, PAGE_HEADER.headingId);
    assert.equal(heading.getAttribute("tabindex"), "-1");
  });

  test("optional description, account chip and actions", () => {
    render(
      <PageHeader title="Items" description="All of them" account="Alpha">
        <button type="button">Export</button>
      </PageHeader>,
    );
    assert.ok(screen.getByText("All of them"));
    assert.ok(screen.getByText(PAGE_HEADER.accountChip("Alpha")));
    assert.ok(screen.getByRole("button", { name: "Export" }));
  });

  test("leaves out what it was not given", () => {
    render(<PageHeader title="Items" />);
    assert.ok(screen.queryByText(PAGE_HEADER.accountChip("Alpha")) === null);
    assert.ok(screen.queryByRole("button") === null);
  });
});
