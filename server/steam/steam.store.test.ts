/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { createSnapshotStore } from "./steam.store.ts";

test("confirmed transfer hops update the unit counts shown in storage cards", () => {
  const store = createSnapshotStore();
  store.setUnits([
    { id: "source", name: "Source", itemCount: 100 },
    { id: "destination", name: "Destination", itemCount: 999 },
  ]);

  store.setUnitCount("source", 99);
  store.setUnitCount("destination", 999); // second hop was rejected as full
  assert.deepEqual(
    store.getSnapshot().units.map((unit) => unit.itemCount),
    [99, 999],
  );
});

test("touch bumps the revision and notifies subscribers", async () => {
  const store = createSnapshotStore();
  const seen: number[] = [];
  store.subscribe((snapshot) => seen.push(snapshot.revision));
  const before = store.getSnapshot().revision;
  store.touch();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(store.getSnapshot().revision, before + 1);
  assert.deepEqual(seen, [before + 1]);
});
