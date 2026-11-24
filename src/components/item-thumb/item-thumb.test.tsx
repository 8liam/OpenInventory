/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { fireEvent } from "@testing-library/react";
import { render } from "~test/ui";
import { ItemThumb } from "./item-thumb.component";

describe("ItemThumb", () => {
  test("without an image it renders no img", () => {
    const { container } = render(<ItemThumb imageUrl={null} rarityColor={null} size={40} />);
    assert.equal(container.querySelectorAll("img").length, 0);
  });

  test("the image is decorative and sized", () => {
    const { container } = render(<ItemThumb imageUrl="a.png" rarityColor="#fff" size={40} />);
    const img = container.querySelector("img");
    assert.equal(img?.getAttribute("alt"), "");
    assert.equal(img?.getAttribute("src"), "a.png");
    assert.equal(img?.getAttribute("width"), "40");
  });

  test("loading and failing images both settle without throwing", () => {
    const { container } = render(<ItemThumb imageUrl="b.png" rarityColor={null} size={40} />);
    const img = container.querySelector("img");
    assert.ok(img);
    fireEvent.load(img);
    fireEvent.error(img);
    assert.ok(container.querySelector("img"));
  });
});
