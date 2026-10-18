/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { describe, it } from "node:test";
import { INVENTORY_LOCATION_ID } from "../../src/lib/items/item.types.ts";
import { CASKET_NOTIFICATION } from "../../src/lib/storage/storage.config.ts";
import { runTransfer, type CasketGc } from "./transfer.ts";

type Call = { readonly kind: "add" | "remove"; readonly casketId: string; readonly itemId: string };
type Behaviour = (call: Call) => number | undefined;

/** Fake GC: answers each add/remove with whatever notification the test dictates (or silence). */
function fakeGc(behaviour: Behaviour) {
  const emitter = new EventEmitter();
  const calls: Call[] = [];
  const respond = (call: Call) => {
    calls.push(call);
    const type = behaviour(call);
    if (type !== undefined)
      queueMicrotask(() => emitter.emit("itemCustomizationNotification", [call.casketId], type));
  };
  const gc: CasketGc = {
    addToCasket: (casketId, itemId) => respond({ kind: "add", casketId, itemId }),
    removeFromCasket: (casketId, itemId) => respond({ kind: "remove", casketId, itemId }),
    on: (event, listener) => emitter.on(event, listener),
    off: (event, listener) => emitter.off(event, listener),
  };
  return { gc, calls };
}

const ok: Behaviour = (call) =>
  call.kind === "add" ? CASKET_NOTIFICATION.added : CASKET_NOTIFICATION.removed;
const noPause = () => Promise.resolve();

function job(
  gc: CasketGc,
  from: string,
  to: string,
  ids: string[],
  extra: { isCancelled?: () => boolean; confirmTimeoutMs?: number } = {},
) {
  const progress: number[] = [];
  return {
    progress,
    run: () =>
      runTransfer({
        gc,
        from,
        to,
        itemIds: ids,
        nameOf: (id) => `item-${id}`,
        onProgress: (done) => progress.push(done),
        isCancelled: extra.isCancelled ?? (() => false),
        pause: noPause,
        confirmTimeoutMs: extra.confirmTimeoutMs ?? 500,
      }),
  };
}

describe("runTransfer", () => {
  it("adds inventory items to a unit and confirms each", async () => {
    const { gc, calls } = fakeGc(ok);
    const j = job(gc, INVENTORY_LOCATION_ID, "U2", ["1", "2"]);
    const outcome = await j.run();
    assert.deepEqual(outcome, { done: 2, failures: [], cancelled: false });
    assert.deepEqual(
      calls.map((c) => `${c.kind}:${c.casketId}:${c.itemId}`),
      ["add:U2:1", "add:U2:2"],
    );
    assert.deepEqual(j.progress, [1, 2]);
  });

  it("moves unit to unit through the inventory, remove before add, per item", async () => {
    const { gc, calls } = fakeGc(ok);
    const outcome = await job(gc, "U1", "U2", ["1", "2"]).run();
    assert.equal(outcome.done, 2);
    assert.deepEqual(
      calls.map((c) => `${c.kind}:${c.casketId}:${c.itemId}`),
      ["remove:U1:1", "add:U2:1", "remove:U1:2", "add:U2:2"],
    );
  });

  it("moves a unit's items to the inventory with a single hop", async () => {
    const { gc, calls } = fakeGc(ok);
    await job(gc, "U1", INVENTORY_LOCATION_ID, ["9"]).run();
    assert.deepEqual(
      calls.map((c) => c.kind),
      ["remove"],
    );
  });

  it("stops on a full destination and says where the item is", async () => {
    const { gc } = fakeGc((call) =>
      call.kind === "add" ? CASKET_NOTIFICATION.tooFull : CASKET_NOTIFICATION.removed,
    );
    const outcome = await job(gc, "U1", "U2", ["1", "2", "3"]).run();
    assert.equal(outcome.done, 0);
    assert.equal(outcome.failures.length, 1, "does not keep hammering a full unit");
    assert.match(
      outcome.failures[0]?.reason ?? "",
      /destination storage unit is full.*left in your inventory/,
    );
  });

  it("stops on a full inventory without touching the destination", async () => {
    const { gc, calls } = fakeGc(() => CASKET_NOTIFICATION.inventoryFull);
    const outcome = await job(gc, "U1", "U2", ["1", "2"]).run();
    assert.equal(outcome.failures.length, 1);
    assert.match(outcome.failures[0]?.reason ?? "", /inventory is full/);
    assert.ok(calls.every((c) => c.kind === "remove"));
  });

  it("records a timeout when the GC never answers, and continues", async () => {
    const { gc } = fakeGc(() => undefined);
    const outcome = await job(gc, INVENTORY_LOCATION_ID, "U2", ["1", "2"], {
      confirmTimeoutMs: 15,
    }).run();
    assert.equal(outcome.done, 0);
    assert.equal(outcome.failures.length, 2);
    assert.match(outcome.failures[0]?.reason ?? "", /did not confirm/);
  });

  it("ignores notifications for other units", async () => {
    const emitter = new EventEmitter();
    const gc: CasketGc = {
      addToCasket: () =>
        queueMicrotask(() =>
          emitter.emit("itemCustomizationNotification", ["OTHER"], CASKET_NOTIFICATION.added),
        ),
      removeFromCasket: () => undefined,
      on: (e, l) => emitter.on(e, l),
      off: (e, l) => emitter.off(e, l),
    };
    const outcome = await job(gc, INVENTORY_LOCATION_ID, "U2", ["1"], {
      confirmTimeoutMs: 15,
    }).run();
    assert.equal(outcome.done, 0);
    assert.match(outcome.failures[0]?.reason ?? "", /did not confirm/);
  });

  it("stops between items when cancelled", async () => {
    const { gc } = fakeGc(ok);
    let items = 0;
    const j = job(gc, INVENTORY_LOCATION_ID, "U2", ["1", "2", "3"], {
      isCancelled: () => items++ >= 1,
    });
    const outcome = await j.run();
    assert.equal(outcome.cancelled, true);
    assert.equal(outcome.done, 1);
  });

  it("leaves no listeners behind", async () => {
    const emitter = new EventEmitter();
    const gc: CasketGc = {
      addToCasket: (casketId) =>
        queueMicrotask(() =>
          emitter.emit("itemCustomizationNotification", [casketId], CASKET_NOTIFICATION.added),
        ),
      removeFromCasket: () => undefined,
      on: (e, l) => emitter.on(e, l),
      off: (e, l) => emitter.off(e, l),
    };
    await job(gc, INVENTORY_LOCATION_ID, "U2", ["1", "2", "3"]).run();
    assert.equal(emitter.listenerCount("itemCustomizationNotification"), 0);
  });
});
