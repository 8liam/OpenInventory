import { createHash, randomBytes } from "node:crypto";
import { SHARE_LIMITS, SHARE_TOKEN_CHARACTERS } from "./share.config.ts";

const HASH_ALGORITHM = "sha256";

/** A new unguessable token for a share link. Only its hash is stored. */
export function createShareToken(): string {
  return randomBytes(SHARE_LIMITS.tokenBytes).toString("base64url");
}

/** Cheap shape check before any lookup, so junk never reaches the database. */
export function isWellFormedToken(value: string): boolean {
  return value.length === SHARE_LIMITS.tokenLength && SHARE_TOKEN_CHARACTERS.test(value);
}

/**
 * The value stored in place of a token. A 256-bit random token can't be brute-forced
 * from its hash, so a plain SHA-256 is enough, and it lets lookups stay indexed.
 */
export function hashShareToken(token: string): string {
  return createHash(HASH_ALGORITHM).update(token, "utf8").digest("hex");
}
