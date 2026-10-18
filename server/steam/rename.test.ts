/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { encodeNameItem } from "./rename.ts";

test("encodes subject item id and name as CMsgModifyItemStringAttr", () => {
  const encoded = encodeNameItem("300", "Vault");
  assert.deepEqual([...encoded], [0x10, 0xac, 0x02, 0x22, 5, ...Buffer.from("Vault")]);
});

test("encodes ids above 2^53 without losing precision", () => {
  const id = "18446744073709551615";
  const encoded = encodeNameItem(id, "x");
  assert.deepEqual([...encoded.subarray(0, 11)], [0x10, ...Array(9).fill(0xff), 0x01]);
});

test("encodes multi-byte names by byte length", () => {
  const encoded = encodeNameItem("1", "é");
  assert.deepEqual([...encoded], [0x10, 1, 0x22, 2, 0xc3, 0xa9]);
});
