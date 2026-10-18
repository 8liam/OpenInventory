import { INVENTORY_LOCATION_ID } from "../../src/lib/items/item.types.ts";
import { CASKET_NOTIFICATION, STORAGE_LIMITS } from "../../src/lib/storage/storage.config.ts";
import type { TransferFailure } from "../../src/lib/storage/storage.types.ts";

/** The slice of `globaloffensive` a transfer needs; small enough to fake in tests. */
export type CasketGc = {
  readonly addToCasket: (casketId: string, itemId: string) => void;
  readonly removeFromCasket: (casketId: string, itemId: string) => void;
  readonly on: (event: "itemCustomizationNotification", listener: NotificationListener) => unknown;
  readonly off: (event: "itemCustomizationNotification", listener: NotificationListener) => unknown;
};

type NotificationListener = (itemIds: readonly string[], notificationType: number) => void;

export type TransferJob = {
  readonly gc: CasketGc;
  readonly from: string;
  readonly to: string;
  readonly itemIds: readonly string[];
  readonly nameOf: (itemId: string) => string;
  readonly onProgress: (done: number) => void;
  readonly isCancelled: () => boolean;
  /** Overridable so tests don't wait on real timers. */
  readonly pause?: (ms: number) => Promise<void>;
  readonly confirmTimeoutMs?: number;
};

export type TransferOutcome = {
  readonly done: number;
  readonly failures: readonly TransferFailure[];
  readonly cancelled: boolean;
};

const defaultPause = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Resolves with the notification type once the GC confirms (or refuses) the action on `casketId`. */
function awaitCasketNotification(
  gc: CasketGc,
  casketId: string,
  accepted: readonly number[],
  timeoutMs: number,
): Promise<number> {
  return new Promise((resolve, reject) => {
    const listener: NotificationListener = (itemIds, type) => {
      if (String(itemIds[0]) !== casketId || !accepted.includes(type)) return;
      clearTimeout(timer);
      gc.off("itemCustomizationNotification", listener);
      resolve(type);
    };
    const timer = setTimeout(() => {
      gc.off("itemCustomizationNotification", listener);
      reject(new Error("The Game Coordinator did not confirm the move in time"));
    }, timeoutMs);
    gc.on("itemCustomizationNotification", listener);
  });
}

async function removeFromUnit(
  gc: CasketGc,
  unitId: string,
  itemId: string,
  timeoutMs: number,
): Promise<void> {
  const confirmation = awaitCasketNotification(
    gc,
    unitId,
    [CASKET_NOTIFICATION.removed, CASKET_NOTIFICATION.inventoryFull],
    timeoutMs,
  );
  gc.removeFromCasket(unitId, itemId);
  if ((await confirmation) === CASKET_NOTIFICATION.inventoryFull)
    throw new Error("Your inventory is full");
}

async function addToUnit(
  gc: CasketGc,
  unitId: string,
  itemId: string,
  timeoutMs: number,
): Promise<void> {
  const confirmation = awaitCasketNotification(
    gc,
    unitId,
    [CASKET_NOTIFICATION.added, CASKET_NOTIFICATION.tooFull],
    timeoutMs,
  );
  gc.addToCasket(unitId, itemId);
  if ((await confirmation) === CASKET_NOTIFICATION.tooFull)
    throw new Error("The destination storage unit is full");
}

/**
 * Moves items one at a time, waiting for the GC to confirm each hop. Unit to
 * unit goes through the inventory, so a failure on the second hop is reported
 * as "left in your inventory".
 */
export async function runTransfer(job: TransferJob): Promise<TransferOutcome> {
  const pause = job.pause ?? defaultPause;
  const timeoutMs = job.confirmTimeoutMs ?? STORAGE_LIMITS.moveConfirmTimeoutMs;
  const failures: TransferFailure[] = [];
  let done = 0;
  let cancelled = false;

  for (const itemId of job.itemIds) {
    if (job.isCancelled()) {
      cancelled = true;
      break;
    }
    let leftInInventory = false;
    try {
      if (job.from !== INVENTORY_LOCATION_ID) {
        await removeFromUnit(job.gc, job.from, itemId, timeoutMs);
        leftInInventory = true;
      }
      if (job.to !== INVENTORY_LOCATION_ID) {
        await addToUnit(job.gc, job.to, itemId, timeoutMs);
        leftInInventory = false;
      }
      done += 1;
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      failures.push({
        itemId,
        name: job.nameOf(itemId),
        reason: leftInInventory ? `${reason}; the item was left in your inventory` : reason,
      });
      // A full inventory/unit will fail every remaining item the same way.
      if (/full/i.test(reason)) break;
    }
    job.onProgress(done);
    await pause(STORAGE_LIMITS.moveGapMs);
  }
  return { done, failures, cancelled };
}
