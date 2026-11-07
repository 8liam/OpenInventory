/** Limits for share links. Tokens are 256-bit random values, so the rate limit only blunts scraping. */
export const SHARE_LIMITS = {
  tokenBytes: 32,
  /** Length of a base64url-encoded token with no padding. */
  tokenLength: 43,
  /** Most items one link can name; a unit can never hold more than this anyway. */
  maxSharedItems: 1000,
  /** Public requests allowed per client address per window, including invalid tokens. */
  rateLimitMax: 60,
  rateLimitWindowMs: 60_000,
} as const;

/** Item ids are asset ids: decimal digits only. */
export const SHARE_ITEM_ID_PATTERN = /^\d{1,20}$/;

/** The page and asset paths a recipient's browser needs before it can show a share. */
export const SHARE_PUBLIC_PATHS = {
  /** A share page: GET only, served as the SPA shell. */
  page: /^\/share\/[^/]*$/,
  /** Build output (JS, CSS, fonts), which is public and carries no data. */
  assetPrefix: "/assets/",
  /** The favicon `index.html` references. */
  icon: "/logo.svg",
} as const;

export const SHARE_TOKEN_CHARACTERS = /^[A-Za-z0-9_-]+$/;

export const SHARE_HEADERS = {
  /** A revoked or expired link must stop working at once, so nothing may cache it. */
  cacheControl: "no-store",
  robots: "noindex, nofollow",
} as const;

export const SHARE_ERRORS = {
  notFound: "Not found",
  unavailable:
    "This share is unavailable right now. Try again once the owner's inventory has loaded.",
  rateLimited: "Too many requests",
  methodNotAllowed: "Method not allowed",
} as const;

export const SHARE_STATUS = {
  ok: 200,
  created: 201,
  noContent: 204,
  badRequest: 400,
  notFound: 404,
  methodNotAllowed: 405,
  tooManyRequests: 429,
  unavailable: 503,
} as const;

export const SHARE_CURRENCY_PATTERN = /^[A-Z]{3}$/;

/** Link ids are random UUIDs. */
export const SHARE_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
