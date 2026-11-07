/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveScope, scopeAccountIds } from "./account-scope.ts";

const A = "76561190000000001";
const B = "76561190000000002";

test("a remembered account that still exists is kept", () => {
  assert.equal(resolveScope(B, [A, B]), B);
});

test("a removed or unknown account falls back to the first one", () => {
  assert.equal(resolveScope(B, [A]), A);
  assert.equal(resolveScope(undefined, [A, B]), A);
});

test("all needs more than one account to mean anything", () => {
  assert.equal(resolveScope("all", [A, B]), "all");
  assert.equal(resolveScope("all", [A]), A);
});

test("no accounts means no scope", () => {
  assert.equal(resolveScope(A, []), undefined);
  assert.deepEqual(scopeAccountIds(undefined, []), []);
});

test("scopeAccountIds expands all and wraps a single account", () => {
  assert.deepEqual(scopeAccountIds("all", [A, B]), [A, B]);
  assert.deepEqual(scopeAccountIds(B, [A, B]), [B]);
});
