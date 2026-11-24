/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, test } from "node:test";
import { makeItem } from "~test/fixtures";
import { render, screen, setupUser } from "~test/ui";
import { ExportItems } from "./export-items.component";
import { EXPORT_ITEMS } from "./export-items.config";

describe("ExportItems", () => {
  const realCreate = URL.createObjectURL;
  const realRevoke = URL.revokeObjectURL;
  const realClick = HTMLAnchorElement.prototype.click;
  let blobs: Blob[] = [];
  let downloads: string[] = [];
  beforeEach(() => {
    blobs = [];
    downloads = [];
    URL.createObjectURL = (blob: Blob | MediaSource) => {
      blobs.push(blob as Blob);
      return "blob:test";
    };
    URL.revokeObjectURL = () => {};
    HTMLAnchorElement.prototype.click = function click(this: HTMLAnchorElement) {
      downloads.push(this.download);
    };
  });
  afterEach(() => {
    URL.createObjectURL = realCreate;
    URL.revokeObjectURL = realRevoke;
    HTMLAnchorElement.prototype.click = realClick;
  });

  test("the CSV button downloads the items as csv", async () => {
    render(<ExportItems items={[makeItem()]} currency="USD" />);
    await setupUser().click(screen.getByRole("button", { name: EXPORT_ITEMS.label }));
    assert.equal(blobs[0]?.type, EXPORT_ITEMS.mimeType);
    assert.ok(downloads[0]?.endsWith(".csv"));
    assert.ok((await blobs[0]?.text())?.includes("AK-47 | Redline"));
  });

  test("the JSON button downloads the items as json", async () => {
    render(<ExportItems items={[makeItem()]} currency="USD" />);
    await setupUser().click(screen.getByRole("button", { name: EXPORT_ITEMS.jsonLabel }));
    assert.equal(blobs[0]?.type, EXPORT_ITEMS.jsonMimeType);
    assert.ok(downloads[0]?.endsWith(".json"));
  });

  test("with nothing to export both buttons are disabled", () => {
    render(<ExportItems items={[]} currency="USD" />);
    for (const button of screen.getAllByRole("button"))
      assert.equal((button as HTMLButtonElement).disabled, true);
  });
});
