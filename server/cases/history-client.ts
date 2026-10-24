import { HISTORY_API } from "./cases.config.ts";
import type { HistoryCursor, HistoryFailure, HistoryPage } from "./cases.types.ts";

export class HistoryError extends Error {
  readonly failure: HistoryFailure;
  constructor(failure: HistoryFailure, message: string) {
    super(message);
    this.failure = failure;
  }
}

type RawPage = {
  readonly success?: boolean;
  readonly html?: string;
  readonly descriptions?: HistoryPage["descriptions"];
  readonly cursor?: { readonly time?: number; readonly time_frac?: number; readonly s?: string };
};

/** Steam renders history dates in the zone given by this cookie; match the server's own. */
function timezoneCookie(): string {
  return `timezoneOffset=${-new Date().getTimezoneOffset() * 60},0`;
}

function pageUrl(steamId: string, before: HistoryCursor | number): string {
  const cursor = typeof before === "number" ? { time: before, timeFrac: 0, s: undefined } : before;
  const params = new URLSearchParams({
    ajax: "1",
    l: HISTORY_API.language,
    "cursor[time]": String(cursor.time),
    "cursor[time_frac]": String(cursor.timeFrac),
  });
  if (cursor.s !== undefined) params.set("cursor[s]", cursor.s);
  params.append("app[]", String(HISTORY_API.appId));
  return `${HISTORY_API.origin}/profiles/${steamId}/inventoryhistory/?${params}`;
}

/** Fetches the page of history older than `before` (a cursor, or an epoch-seconds start). */
export async function fetchHistoryPage(
  steamId: string,
  cookies: readonly string[],
  before: HistoryCursor | number,
): Promise<HistoryPage> {
  const response = await fetch(pageUrl(steamId, before), {
    headers: {
      cookie: [...cookies, timezoneCookie()].join("; "),
      "x-requested-with": "XMLHttpRequest",
      accept: "application/json",
    },
    signal: AbortSignal.timeout(HISTORY_API.requestTimeoutMs),
  });
  if (response.status === 429) throw new HistoryError("rate-limited", "Steam is rate limiting");
  // A lapsed session is bounced to the login page rather than failing outright.
  if (new URL(response.url).pathname.startsWith(HISTORY_API.loginPath))
    throw new HistoryError("auth", "Steam web session is not signed in");
  if (!response.ok) throw new HistoryError("unavailable", `Steam returned ${response.status}`);
  let body: RawPage;
  try {
    body = (await response.json()) as RawPage;
  } catch {
    throw new HistoryError("auth", "Steam returned a non-JSON page");
  }
  if (!body.success || typeof body.html !== "string")
    throw new HistoryError("auth", "Steam did not return history");
  const { cursor } = body;
  return {
    html: body.html,
    descriptions: body.descriptions ?? {},
    cursor:
      cursor?.time === undefined
        ? undefined
        : { time: cursor.time, timeFrac: cursor.time_frac ?? 0, s: cursor.s ?? "" },
  };
}
