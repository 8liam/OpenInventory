import { readFile, stat } from "node:fs/promises";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { extname, join, normalize, sep } from "node:path";
import { timingSafeEqual } from "node:crypto";
import {
  GC_ATTRIBUTE,
  SSE_KEEP_ALIVE_MS,
  STORAGE_API,
  STORAGE_LIMITS,
} from "../src/lib/storage/storage.config.ts";
import type {
  ApiError,
  ActivateTerminalRequest,
  RenameUnitRequest,
  TransferRequest,
} from "../src/lib/storage/storage.types.ts";
import { DEFAULT_OPENING_KIND, OPENING_KINDS } from "../src/lib/cases/cases.config.ts";
import type { OpeningKind } from "../src/lib/cases/cases.types.ts";
import { buildCaseStats } from "./cases/case-stats.ts";
import { createHistorySync } from "./cases/history-sync.ts";
import { openDatabase } from "./db/db.ts";
import { buildDashboard, summarizeValue } from "./dashboard.ts";
import { collectItems } from "./items/collect.ts";
import type { TerminalOffer, TerminalOfferResponse } from "../src/lib/items/item.types.ts";
import { loadCatalog, readUInt32 } from "./items/catalog.ts";
import {
  DEFAULT_MARKETPLACE,
  LEGACY_HISTORY_MARKETPLACE,
  MARKETPLACES,
} from "../src/lib/settings/settings.config.ts";
import type { Marketplace } from "../src/lib/settings/settings.types.ts";
import { getPriceBook } from "./prices/prices.ts";
import { readSettings, SERVER_LIMITS } from "./server.config.ts";
import { createRealGateway } from "./steam/steam.real.ts";
import { UserFacingError } from "./steam/steam.types.ts";
import { computeTradeUp, listTradeUpCandidates, type TradeUpCandidate } from "./tradeup.ts";

const HTTP = {
  ok: 200,
  accepted: 202,
  noContent: 204,
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  conflict: 409,
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
const TRACKED_SCOPES_KEY = "pref:price-scopes";

const settings = readSettings();
const db = openDatabase(settings.dataDir);
const catalog = await loadCatalog(db);
const gateway = createRealGateway(db, settings.dataDir, (raw) => catalog.describe(raw).view.name);
const historySync = createHistorySync(db, gateway);

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

function parseActivateRequest(body: unknown): ActivateTerminalRequest {
  const id = typeof body === "object" && body !== null ? (body as { id?: unknown }).id : undefined;
  if (typeof id !== "string" || !ITEM_ID_PATTERN.test(id)) {
    throw new UserFacingError("Invalid activation request", HTTP.badRequest);
  }
  return { id };
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

type PriceScope = { readonly currency: string; readonly marketplace: Marketplace };

function parseMarketplace(url: URL): Marketplace {
  const value = url.searchParams.get("marketplace") ?? DEFAULT_MARKETPLACE;
  const marketplace = MARKETPLACES.find((m) => m === value);
  if (!marketplace) throw new UserFacingError("Invalid marketplace", HTTP.badRequest);
  return marketplace;
}

function parseScope(url: URL): PriceScope {
  return { currency: parseCurrency(url), marketplace: parseMarketplace(url) };
}

/** History rows are keyed by this; the legacy marketplace keeps its pre-marketplace rows. */
function historyCurrency({ currency, marketplace }: PriceScope): string {
  return marketplace === LEGACY_HISTORY_MARKETPLACE ? currency : `${currency}:${marketplace}`;
}

function parseOpeningKind(url: URL): OpeningKind {
  const value = url.searchParams.get("kind") ?? DEFAULT_OPENING_KIND;
  const kind = OPENING_KINDS.find((k) => k === value);
  if (!kind) throw new UserFacingError("Invalid kind", HTTP.badRequest);
  return kind;
}

async function loadPrices({ currency, marketplace }: PriceScope, force = false) {
  try {
    return await getPriceBook(db, currency, marketplace, force);
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

async function recordSnapshot(steamId: string, scope: PriceScope): Promise<void> {
  const key = { steamId, currency: historyCurrency(scope) };
  const flightKey = `${steamId}:${key.currency}`;
  if (snapshotsInFlight.has(flightKey)) return;
  const last = db.lastSnapshotAt(key);
  if (last !== undefined && Date.now() - last < SERVER_LIMITS.snapshotIntervalMs) return;
  snapshotsInFlight.add(flightKey);
  try {
    await writeSnapshot(key, scope);
  } finally {
    snapshotsInFlight.delete(flightKey);
  }
}

async function writeSnapshot(
  key: { readonly steamId: string; readonly currency: string },
  scope: PriceScope,
): Promise<void> {
  const snapshot = gateway.getSnapshot();
  if (snapshot.loadingUnits || snapshot.units.some((u) => !u.loaded)) return; // partial storage data would record a false dip
  const book = await loadPrices(scope);
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
      const scope = parseScope(url);
      const { currency } = scope;
      const book = await loadPrices(scope);
      const items = collectItems(gateway, catalog, book).map((c) => c.view);
      return sendJson(res, HTTP.ok, { items, currency, priceUpdatedAt: book.fetchedAt });
    }

    if (path === STORAGE_API.dashboard && method === "GET") {
      const steamId = requireReady();
      const scope = parseScope(url);
      const { currency } = scope;
      rememberScope(scope);
      const book = await loadPrices(scope);
      const items = collectItems(gateway, catalog, book).map((c) => c.view);
      const units = gateway.getSnapshot().units;
      void recordSnapshot(steamId, scope).catch((e: unknown) => console.warn("[snapshot]", e));
      return sendJson(
        res,
        HTTP.ok,
        buildDashboard({
          items,
          history: db.listSnapshots({ steamId, currency: historyCurrency(scope) }),
          currency,
          priceUpdatedAt: book.fetchedAt,
          unitsLoaded: units.filter((u) => u.loaded).length,
          unitsTotal: units.length,
        }),
      );
    }

    if (path === STORAGE_API.cases && method === "GET") {
      const steamId = requireReady();
      historySync.start(steamId, { onlyIfStale: true });
      return sendJson(res, HTTP.ok, {
        stats: buildCaseStats(db.loadHistoryEvents(steamId), parseOpeningKind(url)),
        sync: historySync.status(steamId),
      });
    }

    if ((path === STORAGE_API.tradeUp || path === STORAGE_API.tradeUpOdds) && method === "GET") {
      requireReady();
      const scope = parseScope(url);
      const { currency } = scope;
      const rarity = url.searchParams.get("rarity") ?? "";
      const book = await loadPrices(scope);
      const candidates: TradeUpCandidate[] = collectItems(gateway, catalog, book).flatMap((c) =>
        c.skin ? [{ view: c.view, skin: c.skin }] : [],
      );
      if (path === STORAGE_API.tradeUp) {
        return sendJson(res, HTTP.ok, listTradeUpCandidates(candidates, rarity, catalog, currency));
      }
      const ids = (url.searchParams.get("ids") ?? "").split(",").filter(Boolean);
      return sendJson(
        res,
        HTTP.ok,
        computeTradeUp(candidates, ids, rarity, catalog, book, currency),
      );
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
      if (path === STORAGE_API.activateTerminal) {
        assertJsonBody(req);
        requireReady();
        const { id } = parseActivateRequest(await readBody(req));
        const raw = gateway.getInventory().find((item) => item.id === id);
        const terminal = raw ? catalog.describe(raw).view.terminal : null;
        if (!terminal) throw new UserFacingError("That item isn't a Terminal", HTTP.badRequest);
        if (terminal.isActive)
          throw new UserFacingError("That Terminal is already active", HTTP.conflict);
        await gateway.activateTerminal(id);
        return void res.writeHead(HTTP.noContent).end();
      }
      if (path === STORAGE_API.terminalOffer || path === STORAGE_API.terminalNextOffer) {
        assertJsonBody(req);
        requireReady();
        const scope = parseScope(url);
        const { id } = parseActivateRequest(await readBody(req));
        const terminalRaw = gateway.getInventory().find((item) => item.id === id);
        const terminal = terminalRaw ? catalog.describe(terminalRaw).view.terminal : null;
        if (!terminal?.isActive)
          throw new UserFacingError("That isn't an active Terminal", HTTP.badRequest);
        const book = await loadPrices(scope);
        const offered =
          path === STORAGE_API.terminalNextOffer
            ? await gateway.requestNextOffer(id)
            : await gateway.getTerminalOffer(id);
        // Asking for an offer changes the Terminal's own points, so describe it again afterwards.
        const refreshed = gateway.getInventory().find((item) => item.id === id);
        const offers = offered.map((raw): TerminalOffer => {
          const { view } = catalog.describe(raw);
          return {
            ...view,
            purchaseCost: readUInt32(raw, GC_ATTRIBUTE.purchasePrice) ?? null,
            price: view.marketHashName
              ? (book.byName.get(view.marketHashName)?.price ?? null)
              : null,
          };
        });
        return sendJson(res, HTTP.ok, {
          offers,
          isFinalOffer:
            (refreshed && catalog.describe(refreshed).view.terminal?.isFinalOffer) ?? false,
          currency: scope.currency,
        } satisfies TerminalOfferResponse);
      }
      if (path === STORAGE_API.casesSync) {
        historySync.start(requireReady());
        return void res.writeHead(HTTP.accepted).end();
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
        await loadPrices(parseScope(url), true);
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

/** Currency/marketplace pairs the dashboard has been viewed in; the background job records history for each. */
function trackedScopes(): PriceScope[] {
  const raw = db.getCacheStale(TRACKED_SCOPES_KEY);
  const stored = raw ? (JSON.parse(raw) as string[]) : [];
  const scopes = new Map<string, PriceScope>();
  for (const entry of [`${DEFAULT_CURRENCY}:${DEFAULT_MARKETPLACE}`, ...stored]) {
    const [currency = DEFAULT_CURRENCY, marketplace] = entry.split(":");
    const known = MARKETPLACES.find((m) => m === marketplace);
    if (known) scopes.set(entry, { currency, marketplace: known });
  }
  return [...scopes.values()];
}

function scopeId({ currency, marketplace }: PriceScope): string {
  return `${currency}:${marketplace}`;
}

function rememberScope(scope: PriceScope): void {
  const known = trackedScopes();
  if (!known.some((s) => scopeId(s) === scopeId(scope)))
    db.setCache(TRACKED_SCOPES_KEY, JSON.stringify([...known, scope].map(scopeId)));
}

// Record history even when nobody has the dashboard open. `onReady` fires on every
// (re)connect, so the timers are only started once.
let snapshotJobStarted = false;
gateway.onReady((steamId) => {
  if (snapshotJobStarted) return;
  snapshotJobStarted = true;
  const tick = () => {
    for (const scope of trackedScopes()) {
      void recordSnapshot(steamId, scope).catch((e: unknown) => console.warn("[snapshot]", e));
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
