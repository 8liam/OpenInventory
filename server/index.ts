import { readFile, stat } from "node:fs/promises";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { extname, join, normalize, sep } from "node:path";
import { timingSafeEqual } from "node:crypto";
import {
  SSE_KEEP_ALIVE_MS,
  STORAGE_API,
  STORAGE_LIMITS,
} from "../src/lib/storage/storage.config.ts";
import type {
  ApiError,
  RenameUnitRequest,
  TransferRequest,
} from "../src/lib/storage/storage.types.ts";
import { openDatabase } from "./db/db.ts";
import { buildDashboard, summarizeValue } from "./dashboard.ts";
import { collectItems } from "./items/collect.ts";
import { loadCatalog } from "./items/catalog.ts";
import { getPriceBook } from "./prices/prices.ts";
import { readSettings, SERVER_LIMITS } from "./server.config.ts";
import { createRealGateway } from "./steam/steam.real.ts";
import { UserFacingError } from "./steam/steam.types.ts";
import { computeTradeUp, type TradeUpCandidate } from "./tradeup.ts";

const HTTP = {
  ok: 200,
  accepted: 202,
  noContent: 204,
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  methodNotAllowed: 405,
  unsupportedMedia: 415,
  serverError: 500,
  badGateway: 502,
} as const;
const DEFAULT_CURRENCY = "USD";
const CURRENCY_PATTERN = /^[A-Z]{3}$/;
const MIME: Readonly<Record<string, string>> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".json": "application/json",
  ".woff2": "font/woff2",
};
const IMMUTABLE_CACHE = "public, max-age=31536000, immutable";
const INDEX_FILE = "index.html";
const HEALTH_PATH = "/healthz";
const JSON_CONTENT_TYPE = "application/json";
// eslint-disable-next-line no-control-regex -- rejecting control characters is the point
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/;
const ITEM_ID_PATTERN = /^(\d{1,20}|inventory)$/;
const TRACKED_CURRENCIES_KEY = "pref:currencies";

const settings = readSettings();
const db = openDatabase(settings.dataDir);
const catalog = await loadCatalog(db);
const gateway = createRealGateway(db, settings.dataDir, (raw) => catalog.describe(raw).view.name);

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
}

function sendError(res: ServerResponse, error: unknown): void {
  const status = error instanceof UserFacingError ? error.status : HTTP.serverError;
  const message = error instanceof UserFacingError ? error.message : "Internal error";
  if (!(error instanceof UserFacingError)) console.error(error);
  sendJson(res, status, { error: message } satisfies ApiError);
}

function isAuthorized(req: IncomingMessage): boolean {
  if (!settings.password) return true;
  const header = req.headers.authorization ?? "";
  if (!header.startsWith("Basic ")) return false;
  const [, password = ""] = Buffer.from(header.slice("Basic ".length), "base64")
    .toString("utf8")
    .split(/:(.*)/s);
  const expected = Buffer.from(settings.password);
  const given = Buffer.from(password);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

async function readBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += (chunk as Buffer).length;
    if (size > STORAGE_LIMITS.maxRequestBytes)
      throw new UserFacingError("Request too large", HTTP.badRequest);
    chunks.push(chunk as Buffer);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new UserFacingError("Body must be JSON", HTTP.badRequest);
  }
}

function parseTransferRequest(body: unknown): TransferRequest {
  const record = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
  const { from, to, itemIds } = record;
  const isId = (value: unknown): value is string =>
    typeof value === "string" && ITEM_ID_PATTERN.test(value);
  if (!isId(from) || !isId(to) || !Array.isArray(itemIds) || !itemIds.every(isId)) {
    throw new UserFacingError("Invalid transfer request", HTTP.badRequest);
  }
  return { from, to, itemIds };
}

function parseRenameRequest(body: unknown): RenameUnitRequest {
  const record = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
  const { id, name } = record;
  if (typeof id !== "string" || !ITEM_ID_PATTERN.test(id) || typeof name !== "string") {
    throw new UserFacingError("Invalid rename request", HTTP.badRequest);
  }
  const trimmed = name.trim();
  if (
    trimmed.length === 0 ||
    trimmed.length > STORAGE_LIMITS.unitNameMaxLength ||
    CONTROL_CHARACTERS.test(trimmed)
  ) {
    throw new UserFacingError(
      `Names are 1 to ${STORAGE_LIMITS.unitNameMaxLength} characters`,
      HTTP.badRequest,
    );
  }
  return { id, name: trimmed };
}

function parseCurrency(url: URL): string {
  const value = url.searchParams.get("currency") ?? DEFAULT_CURRENCY;
  if (!CURRENCY_PATTERN.test(value)) throw new UserFacingError("Invalid currency", HTTP.badRequest);
  return value;
}

async function loadPrices(currency: string, force = false) {
  try {
    return await getPriceBook(db, currency, force);
  } catch (error) {
    throw new UserFacingError(
      `Price source unavailable: ${error instanceof Error ? error.message : String(error)}`,
      HTTP.badGateway,
    );
  }
}

/**
 * State-changing requests must come from this site. A cross-site page can send a
 * "simple" POST without a preflight, so check Origin and demand a JSON body type.
 */
function assertSameOrigin(req: IncomingMessage): void {
  const origin = req.headers.origin;
  if (origin !== undefined) {
    let originHost: string | undefined;
    try {
      originHost = new URL(origin).host;
    } catch {
      originHost = undefined;
    }
    if (originHost !== req.headers.host)
      throw new UserFacingError("Cross-origin request blocked", HTTP.forbidden);
  }
}

function assertJsonBody(req: IncomingMessage): void {
  if (!req.headers["content-type"]?.startsWith(JSON_CONTENT_TYPE)) {
    throw new UserFacingError("Content-Type must be application/json", HTTP.unsupportedMedia);
  }
}

function requireReady(): string {
  const steamId = gateway.getSteamId();
  if (gateway.getSnapshot().auth.status !== "ready" || !steamId)
    throw new UserFacingError("Sign in with Steam first", HTTP.unauthorized);
  return steamId;
}

/** Persists a value snapshot at most once per interval so the dashboard can chart history. */
const snapshotsInFlight = new Set<string>();

async function recordSnapshot(steamId: string, currency: string): Promise<void> {
  const key = { steamId, currency };
  const flightKey = `${steamId}:${currency}`;
  if (snapshotsInFlight.has(flightKey)) return;
  const last = db.lastSnapshotAt(key);
  if (last !== undefined && Date.now() - last < SERVER_LIMITS.snapshotIntervalMs) return;
  snapshotsInFlight.add(flightKey);
  try {
    await writeSnapshot(key);
  } finally {
    snapshotsInFlight.delete(flightKey);
  }
}

async function writeSnapshot(key: {
  readonly steamId: string;
  readonly currency: string;
}): Promise<void> {
  const { currency } = key;
  const snapshot = gateway.getSnapshot();
  if (snapshot.loadingUnits || snapshot.units.some((u) => !u.loaded)) return; // partial storage data would record a false dip
  const book = await loadPrices(currency);
  const items = collectItems(gateway, catalog, book).map((c) => c.view);
  if (items.length === 0) return;
  const { inventoryValue, storageValue, totalValue } = summarizeValue(items);
  db.addSnapshot(key, {
    takenAt: Date.now(),
    totalValue,
    inventoryValue,
    storageValue,
    itemCount: items.length,
  });
}

function handleEvents(req: IncomingMessage, res: ServerResponse): void {
  res.writeHead(HTTP.ok, {
    "content-type": "text/event-stream",
    "cache-control": "no-cache",
    connection: "keep-alive",
  });
  const send = (snapshot: unknown) => res.write(`data: ${JSON.stringify(snapshot)}\n\n`);
  send(gateway.getSnapshot());
  const unsubscribe = gateway.subscribe(send);
  const keepAlive = setInterval(() => res.write(": keep-alive\n\n"), SSE_KEEP_ALIVE_MS);
  req.on("close", () => {
    clearInterval(keepAlive);
    unsubscribe();
  });
}

async function serveStatic(webDir: string, pathname: string, res: ServerResponse): Promise<void> {
  const resolved = normalize(join(webDir, pathname));
  const inside = resolved === webDir || resolved.startsWith(webDir + sep);
  let file = inside ? resolved : join(webDir, INDEX_FILE);
  try {
    if ((await stat(file)).isDirectory()) file = join(file, INDEX_FILE);
  } catch {
    file = join(webDir, INDEX_FILE); // client-side routes fall back to the SPA shell
  }
  const body = await readFile(file);
  const isAsset = file.includes(`${sep}assets${sep}`);
  res.writeHead(HTTP.ok, {
    "content-type": MIME[extname(file)] ?? "application/octet-stream",
    "cache-control": isAsset ? IMMUTABLE_CACHE : "no-cache",
  });
  res.end(body);
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://${settings.host}`);
  const method = req.method ?? "GET";
  try {
    if (url.pathname === HEALTH_PATH) return void res.writeHead(HTTP.ok).end("ok");
    if (!isAuthorized(req)) {
      res.writeHead(HTTP.unauthorized, {
        "www-authenticate": `Basic realm="${SERVER_LIMITS.basicAuthRealm}", charset="UTF-8"`,
      });
      return void res.end();
    }
    const path = url.pathname;
    if (path === STORAGE_API.events && method === "GET") return handleEvents(req, res);
    if (path === STORAGE_API.state && method === "GET")
      return sendJson(res, HTTP.ok, gateway.getSnapshot());

    if (path === STORAGE_API.items && method === "GET") {
      requireReady();
      const currency = parseCurrency(url);
      const book = await loadPrices(currency);
      const items = collectItems(gateway, catalog, book).map((c) => c.view);
      return sendJson(res, HTTP.ok, { items, currency, priceUpdatedAt: book.fetchedAt });
    }

    if (path === STORAGE_API.dashboard && method === "GET") {
      const steamId = requireReady();
      const currency = parseCurrency(url);
      rememberCurrency(currency);
      rememberCurrency(currency);
      const book = await loadPrices(currency);
      const items = collectItems(gateway, catalog, book).map((c) => c.view);
      const units = gateway.getSnapshot().units;
      void recordSnapshot(steamId, currency).catch((e: unknown) => console.warn("[snapshot]", e));
      return sendJson(
        res,
        HTTP.ok,
        buildDashboard({
          items,
          history: db.listSnapshots({ steamId, currency }),
          currency,
          priceUpdatedAt: book.fetchedAt,
          unitsLoaded: units.filter((u) => u.loaded).length,
          unitsTotal: units.length,
        }),
      );
    }

    if (path === STORAGE_API.tradeUp && method === "GET") {
      requireReady();
      const currency = parseCurrency(url);
      const rarity = url.searchParams.get("rarity") ?? "";
      const book = await loadPrices(currency);
      const candidates: TradeUpCandidate[] = collectItems(gateway, catalog, book).flatMap((c) =>
        c.skin ? [{ view: c.view, skin: c.skin }] : [],
      );
      return sendJson(res, HTTP.ok, computeTradeUp(candidates, rarity, catalog, book, currency));
    }

    if (method === "POST") {
      assertSameOrigin(req);
      if (path === STORAGE_API.transfer) {
        assertJsonBody(req);
        requireReady();
        gateway.transferItems(parseTransferRequest(await readBody(req)));
        return void res.writeHead(HTTP.accepted).end();
      }
      if (path === STORAGE_API.renameUnit) {
        assertJsonBody(req);
        requireReady();
        const { id, name } = parseRenameRequest(await readBody(req));
        await gateway.renameUnit(id, name);
        return void res.writeHead(HTTP.noContent).end();
      }
      if (path === STORAGE_API.transferCancel) {
        gateway.cancelTransfer();
        return void res.writeHead(HTTP.noContent).end();
      }
      if (path === STORAGE_API.transferDismiss) {
        gateway.dismissTransfer();
        return void res.writeHead(HTTP.noContent).end();
      }
      if (path === STORAGE_API.qrLogin) {
        await gateway.startQrLogin();
        return void res.writeHead(HTTP.noContent).end();
      }
      if (path === STORAGE_API.logout) {
        gateway.logout();
        return void res.writeHead(HTTP.noContent).end();
      }
      if (path === STORAGE_API.refresh) {
        requireReady();
        await loadPrices(parseCurrency(url), true);
        void gateway.refreshUnits(true);
        return void res.writeHead(HTTP.noContent).end();
      }
    }

    if (path.startsWith("/api/"))
      return sendJson(res, HTTP.notFound, { error: "Not found" } satisfies ApiError);
    if (method !== "GET" && method !== "HEAD")
      return sendJson(res, HTTP.methodNotAllowed, { error: "Method not allowed" });
    if (settings.webDir) return await serveStatic(settings.webDir, path, res);
    sendJson(res, HTTP.notFound, { error: "Not found" } satisfies ApiError);
  } catch (error) {
    sendError(res, error);
  }
});

/** Currencies the dashboard has been viewed in; the background job records history for each. */
function trackedCurrencies(): string[] {
  const raw = db.getCacheStale(TRACKED_CURRENCIES_KEY);
  const stored = raw ? (JSON.parse(raw) as string[]) : [];
  return [...new Set([DEFAULT_CURRENCY, ...stored])];
}

function rememberCurrency(currency: string): void {
  const known = trackedCurrencies();
  if (!known.includes(currency))
    db.setCache(TRACKED_CURRENCIES_KEY, JSON.stringify([...known, currency]));
}

// Record history even when nobody has the dashboard open. `onReady` fires on every
// (re)connect, so the timers are only started once.
let snapshotJobStarted = false;
gateway.onReady((steamId) => {
  if (snapshotJobStarted) return;
  snapshotJobStarted = true;
  const tick = () => {
    for (const currency of trackedCurrencies()) {
      void recordSnapshot(steamId, currency).catch((e: unknown) => console.warn("[snapshot]", e));
    }
  };
  setTimeout(tick, SERVER_LIMITS.snapshotInitialDelayMs);
  setInterval(tick, SERVER_LIMITS.snapshotIntervalMs);
});

server.listen(settings.port, settings.host, () => {
  console.log(
    `[openinventory] listening on http://${settings.host}:${settings.port} (data: ${settings.dataDir})`,
  );
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    server.close();
    db.close();
    process.exit(0);
  });
}
