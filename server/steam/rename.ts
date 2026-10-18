/** Protobuf field tags of CMsgModifyItemStringAttr: (field number << 3) | wire type. */
const TAG = { subjectItemId: 0x10, attrValue: 0x22 } as const;
const VARINT_CONTINUE = 0x80;
const VARINT_MASK = 0x7f;
const VARINT_SHIFT = 7n;

function varint(value: bigint): number[] {
  const bytes: number[] = [];
  let rest = value;
  while (rest > BigInt(VARINT_MASK)) {
    bytes.push(Number(rest & BigInt(VARINT_MASK)) | VARINT_CONTINUE);
    rest >>= VARINT_SHIFT;
  }
  bytes.push(Number(rest));
  return bytes;
}

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
