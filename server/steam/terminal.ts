import { varint } from "./protobuf.ts";

/** Protobuf field tag of CMsgOpenCrate.subject_item_id: (field number << 3) | wire type. */
const TAG_SUBJECT_ITEM_ID = 0x10;

/** Protobuf field tag of CMsgOpenCrate.tool_item_id. */
const TAG_TOOL_ITEM_ID = 0x08;

/** Protobuf field tag of CMsgOpenCrate.points_remaining. */
const TAG_POINTS_REMAINING = 0x20;

/**
 * CMsgOpenCrate (k_EMsgGCOpenCrate) with the Terminal as both tool and subject: asks
 * for an offer. With 0 points it generates the first offer of a freshly activated
 * Terminal; with the Terminal's current points it moves on to the next offer, which
 * can't be undone. points_remaining is always written, as the game does.
 */
export function encodeRequestOffer(itemId: string, pointsRemaining: number): Buffer {
  const id = varint(BigInt(itemId));
  return Buffer.from([
    TAG_TOOL_ITEM_ID,
    ...id,
    TAG_SUBJECT_ITEM_ID,
    ...id,
    TAG_POINTS_REMAINING,
    ...varint(BigInt(pointsRemaining)),
  ]);
}

/**
 * CMsgOpenCrate sent as k_EMsgGCVolatileItemLoadContents: asks the GC to load the
 * offer an active Terminal currently presents. Read-only; nothing is bought.
 */
export function encodeLoadTerminalOffer(itemId: string, pointsRemaining: number): Buffer {
  const points =
    pointsRemaining > 0 ? [TAG_POINTS_REMAINING, ...varint(BigInt(pointsRemaining))] : [];
  return Buffer.from([TAG_SUBJECT_ITEM_ID, ...varint(BigInt(itemId)), ...points]);
}

/**
 * CMsgOpenCrate (k_EMsgGCOpenCrate) for a Terminal. tool_item_id stays unset,
 * because a Terminal needs no key.
 */
export function encodeOpenCrate(itemId: string): Buffer {
  return Buffer.from([TAG_SUBJECT_ITEM_ID, ...varint(BigInt(itemId))]);
}
