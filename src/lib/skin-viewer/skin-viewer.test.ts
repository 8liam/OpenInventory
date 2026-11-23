/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { SKIN_VIEWER_ORIGIN } from "./skin-viewer.config.ts";
import { buildSkinViewerUrl, canPreviewSkin, parseSkinViewerMessage } from "./skin-viewer.ts";

test("builds the embed URL from def, paint, float and seed", () => {
  const url = buildSkinViewerUrl({ defIndex: 7, paintIndex: 180, wear: 0.05, paintSeed: 1 });
  assert.equal(url, "https://3d.chainskins.net/embed?def=7&paint=180&float=0.05&seed=1");
});

test("leaves out float and seed that are missing or out of range", () => {
  assert.equal(
    buildSkinViewerUrl({ defIndex: 7, paintIndex: 180, wear: null, paintSeed: 0 }),
    "https://3d.chainskins.net/embed?def=7&paint=180",
  );
  assert.equal(
    buildSkinViewerUrl({ defIndex: 7, paintIndex: 180, wear: 1.2, paintSeed: 5000 }),
    "https://3d.chainskins.net/embed?def=7&paint=180",
  );
});

test("an item without a def index or a real paint has no preview", () => {
  assert.equal(canPreviewSkin({ defIndex: undefined, paintIndex: 180, wear: null }), false);
  assert.equal(canPreviewSkin({ defIndex: 7, paintIndex: null, wear: null }), false);
  assert.equal(canPreviewSkin({ defIndex: 7, paintIndex: 0, wear: null }), false);
  assert.equal(buildSkinViewerUrl({ defIndex: 7, paintIndex: 0, wear: null }), null);
});

test("accepts embed messages only from the embed origin and the iframe window", () => {
  const frame = {};
  const data = { type: "cs3d:loaded" };
  assert.deepEqual(
    parseSkinViewerMessage({ origin: SKIN_VIEWER_ORIGIN, source: frame, data }, frame),
    {
      kind: "loaded",
    },
  );
  assert.equal(
    parseSkinViewerMessage({ origin: "https://evil.example", source: frame, data }, frame),
    null,
  );
  assert.equal(
    parseSkinViewerMessage({ origin: SKIN_VIEWER_ORIGIN, source: {}, data }, frame),
    null,
  );
  assert.equal(
    parseSkinViewerMessage({ origin: SKIN_VIEWER_ORIGIN, source: frame, data: "x" }, frame),
    null,
  );
});

test("maps the escape key message and ignores other keys", () => {
  const frame = {};
  const origin = SKIN_VIEWER_ORIGIN;
  assert.deepEqual(
    parseSkinViewerMessage(
      { origin, source: frame, data: { type: "cs3d:key", key: "Escape" } },
      frame,
    ),
    { kind: "escape" },
  );
  assert.equal(
    parseSkinViewerMessage({ origin, source: frame, data: { type: "cs3d:key", key: "f" } }, frame),
    null,
  );
});
