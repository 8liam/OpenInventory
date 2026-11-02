/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { gunzipSync } from "node:zlib";
import { acceptsGzip, encodeBody } from "./compression.ts";

const big = Buffer.from(JSON.stringify({ rows: "x".repeat(4000) }));
const JSON_TYPE = "application/json";

test("acceptsGzip parses Accept-Encoding", () => {
  assert.equal(acceptsGzip("gzip, deflate, br"), true);
  assert.equal(acceptsGzip("br, gzip;q=0.5"), true);
  assert.equal(acceptsGzip("*"), true);
  assert.equal(acceptsGzip("gzip;q=0"), false);
  assert.equal(acceptsGzip("br, deflate"), false);
  assert.equal(acceptsGzip(undefined), false);
});

test("encodeBody gzips large compressible bodies", async () => {
  const out = await encodeBody(big, JSON_TYPE, "gzip");
  assert.equal(out.encoding, "gzip");
  assert.ok(out.body.length < big.length);
  assert.deepEqual(gunzipSync(out.body), big);
});

test("encodeBody leaves small, unaccepted and image bodies alone", async () => {
  const small = Buffer.from("{}");
  assert.equal((await encodeBody(small, JSON_TYPE, "gzip")).encoding, undefined);
  assert.equal((await encodeBody(big, JSON_TYPE, "br")).encoding, undefined);
  assert.equal((await encodeBody(big, "image/png", "gzip")).encoding, undefined);
  assert.equal((await encodeBody(big, JSON_TYPE, undefined)).body, big);
});
