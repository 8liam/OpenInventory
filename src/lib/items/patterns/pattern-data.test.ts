/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { PATTERN_FILES } from "../../../../data/index.generated.ts";
import { loadPatternFiles } from "./pattern-data.ts";
import { patternFileSchema } from "./pattern-file.schema.ts";
import { patternFilePath } from "./pattern-file.utils.ts";

const PATTERNS_DIR = fileURLToPath(new URL("../../../../data/patterns/", import.meta.url));

function jsonFiles(dir: string): string[] {
  return readdirSync(dir)
    .sort()
    .flatMap((name) => {
      const path = join(dir, name);
      return statSync(path).isDirectory() ? jsonFiles(path) : name.endsWith(".json") ? [path] : [];
    });
}

test("every data file is valid and lives at the path its weapon and finish give", () => {
  for (const path of jsonFiles(PATTERNS_DIR)) {
    const file = patternFileSchema.parse(JSON.parse(readFileSync(path, "utf8")));
    assert.equal(relative(PATTERNS_DIR, path), patternFilePath(file.weapon, file.finish));
  }
});

test("the generated index lists every data file (run `pnpm data:build` after adding one)", () => {
  const onDisk = jsonFiles(PATTERNS_DIR).map(
    (path) => JSON.parse(readFileSync(path, "utf8")) as unknown,
  );
  assert.deepEqual(PATTERN_FILES, onDisk);
});

test("a duplicate seed inside a group names the group", () => {
  const bad = {
    weapon: "AK-47",
    finish: "Case Hardened",
    retrieved: "2026-01-01",
    sources: ["https://example.com"],
    groups: [{ label: "Blue gem", tiers: [{ seeds: [1, 2] }, { seeds: [2] }] }],
  };
  assert.throws(() => loadPatternFiles([bad]), /seed 2 is listed more than once in "Blue gem"/);
});

test("a phase above the tier count is rejected", () => {
  const bad = {
    weapon: "Karambit",
    finish: "Doppler",
    retrieved: "2026-01-01",
    sources: ["https://example.com"],
    phases: { tierCount: 1, entries: [{ paintIndex: 1, label: "Ruby", tier: 2 }] },
  };
  assert.throws(() => loadPatternFiles([bad]), /above tierCount/);
});

test("a file with neither groups nor phases is rejected", () => {
  const bad = {
    weapon: "AK-47",
    finish: "Redline",
    retrieved: "2026-01-01",
    sources: ["https://example.com"],
  };
  assert.throws(() => loadPatternFiles([bad]), /groups.*phases/);
});
