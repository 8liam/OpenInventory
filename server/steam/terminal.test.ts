/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { encodeRequestOffer, encodeLoadTerminalOffer, encodeOpenCrate } from "./terminal.ts";

test("encodes only the subject item id of CMsgOpenCrate", () => {
  assert.deepEqual([...encodeOpenCrate("300")], [0x10, 0xac, 0x02]);
});

test("encodes ids above 2^53 without losing precision", () => {
  const encoded = encodeOpenCrate("18446744073709551615");
  assert.deepEqual([...encoded], [0x10, ...Array(9).fill(0xff), 0x01]);
});

test("load-offer message adds points only when there are some", () => {
  assert.deepEqual([...encodeLoadTerminalOffer("300", 0)], [0x10, 0xac, 0x02]);
  assert.deepEqual([...encodeLoadTerminalOffer("300", 300)], [0x10, 0xac, 0x02, 0x20, 0xac, 0x02]);
});

test("offer request names the Terminal as tool and subject and always sends points", () => {
  assert.deepEqual(
    [...encodeRequestOffer("300", 0)],
    [0x08, 0xac, 0x02, 0x10, 0xac, 0x02, 0x20, 0x00],
  );
  assert.deepEqual(
    [...encodeRequestOffer("300", 1)],
    [0x08, 0xac, 0x02, 0x10, 0xac, 0x02, 0x20, 0x01],
  );
});
