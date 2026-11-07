import { RANDOM_ID } from "./random-id.config.ts";

/**
 * A random hex id. Uses `getRandomValues`, which (unlike `randomUUID`) also works
 * on plain-HTTP origins such as a self-hosted `http://host.ts.net` address.
 */
export function randomId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(RANDOM_ID.bytes));
  return Array.from(bytes, (byte) =>
    byte.toString(RANDOM_ID.radix).padStart(RANDOM_ID.digitsPerByte, "0"),
  ).join("");
}
