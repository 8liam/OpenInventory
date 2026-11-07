const DAY_MS = 86_400_000;

/** Owner endpoints (signed in) and the unauthenticated, read-only public endpoint. */
export const SHARE_API = {
  shares: "/api/shares",
  revoke: "/api/shares/revoke",
  publicPrefix: "/api/public/share/",
  /** The browser page a recipient opens; `<prefix><token>`. */
  pagePrefix: "/share/",
} as const;

export const SHARE_SCOPE_KINDS = ["all", "unit", "items"] as const;

/** Expiry choices offered in the UI; `never` leaves the link open until it is revoked. */
export const SHARE_EXPIRY_OPTIONS = ["never", "1d", "7d", "30d"] as const;

/** How long each timed choice lasts; keyed so a new option can't be added without a duration. */
export const SHARE_EXPIRY_MS: Record<
  Exclude<(typeof SHARE_EXPIRY_OPTIONS)[number], "never">,
  number
> = {
  "1d": DAY_MS,
  "7d": 7 * DAY_MS,
  "30d": 30 * DAY_MS,
};

/** Headings shown above a shared inventory; the unit's own name is used for unit shares. */
export const SHARE_TITLES = {
  all: "Inventory and storage units",
  items: "Selected items",
} as const;
