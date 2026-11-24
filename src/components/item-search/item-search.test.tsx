/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { COPY } from "~/lib/copy/copy.config";
import { render, screen, setupUser } from "~test/ui";
import { ItemSearch } from "./item-search.component";

describe("ItemSearch", () => {
  test("is a labelled search box showing the value", () => {
    render(<ItemSearch value="ak" onChange={() => {}} />);
    const box = screen.getByRole("searchbox", {
      name: COPY.common.searchPlaceholder,
    }) as HTMLInputElement;
    assert.equal(box.value, "ak");
  });

  test("typing reports each change", async () => {
    const seen: string[] = [];
    render(<ItemSearch value="" onChange={(value) => seen.push(value)} />);
    await setupUser().type(screen.getByRole("searchbox"), "ab");
    assert.deepEqual(seen, ["a", "b"]);
  });

  test("Clear appears with text and empties the search", async () => {
    const seen: string[] = [];
    const { rerender } = render(<ItemSearch value="" onChange={(value) => seen.push(value)} />);
    assert.ok(screen.queryByRole("button") === null);
    rerender(<ItemSearch value="ak" onChange={(value) => seen.push(value)} />);
    await setupUser().click(screen.getByRole("button", { name: COPY.tradeup.clear }));
    assert.deepEqual(seen, [""]);
  });
});
