import { RADIO_KEYS } from "./radio-group.config.ts";

function isOneOf(keys: readonly string[], key: string): boolean {
  return keys.includes(key);
}

/**
 * Which radio an arrow/Home/End key moves to, wrapping at the ends; null when the key means
 * nothing to a radio group.
 */
export function nextRadioIndex(key: string, current: number, count: number): number | null {
  if (count <= 0) return null;
  if (isOneOf(RADIO_KEYS.forward, key)) return (current + 1) % count;
  if (isOneOf(RADIO_KEYS.backward, key)) return (current - 1 + count) % count;
  if (key === RADIO_KEYS.first) return 0;
  if (key === RADIO_KEYS.last) return count - 1;
  return null;
}
