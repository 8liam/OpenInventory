/** Minimal protobuf writing for the few GC messages the library has no encoder for. */
const VARINT_CONTINUE = 0x80;
const VARINT_MASK = 0x7f;
const VARINT_SHIFT = 7n;

export function varint(value: bigint): number[] {
  const bytes: number[] = [];
  let rest = value;
  while (rest > BigInt(VARINT_MASK)) {
    bytes.push(Number(rest & BigInt(VARINT_MASK)) | VARINT_CONTINUE);
    rest >>= VARINT_SHIFT;
  }
  bytes.push(Number(rest));
  return bytes;
}
