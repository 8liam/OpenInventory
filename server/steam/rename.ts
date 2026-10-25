import { varint } from "./protobuf.ts";

/** Protobuf field tags of CMsgModifyItemStringAttr: (field number << 3) | wire type. */
const TAG = { subjectItemId: 0x10, attrValue: 0x22 } as const;
/**
 * CMsgModifyItemStringAttr naming a storage unit (k_EMsgGCNameItem).
 * tool_item_id stays unset, because units need no name tag.
 */
export function encodeNameItem(itemId: string, name: string): Buffer {
  const text = Buffer.from(name, "utf8");
  return Buffer.from([
    TAG.subjectItemId,
    ...varint(BigInt(itemId)),
    TAG.attrValue,
    ...varint(BigInt(text.length)),
    ...text,
  ]);
}
