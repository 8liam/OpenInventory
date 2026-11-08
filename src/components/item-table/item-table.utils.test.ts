/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { joinDetail } from "./item-table.utils.ts";

describe("joinDetail", () => {
  it("joins the location and the float", () => {
    assert.equal(joinDetail(["Knives", "0.1234"], " · "), "Knives · 0.1234");
  });

  it("skips what is missing without a dangling separator", () => {
    assert.equal(joinDetail(["Inventory", null], " · "), "Inventory");
    assert.equal(joinDetail([null, "0.5000"], " · "), "0.5000");
    assert.equal(joinDetail(["", null], " · "), "");
  });
});
