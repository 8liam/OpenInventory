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
import {
  ACCOUNT_LABELS,
  ALL_ACCOUNTS,
  STEAM_ID_PATTERN,
} from "../src/lib/accounts/accounts.config.ts";
import type { AccountLabel } from "../src/lib/accounts/accounts.types.ts";
import { DEFAULT_OPENING_KIND, OPENING_KINDS } from "../src/lib/cases/cases.config.ts";
import type { OpeningKind } from "../src/lib/cases/cases.types.ts";
import { createCaseStatsCache } from "./cases/case-stats-cache.ts";
import { encodeBody } from "./compression.ts";
import { isAllowedHost } from "./host-guard.ts";
import { createHistorySync } from "./cases/history-sync.ts";
import { openDatabase } from "./db/db.ts";
import { buildDashboard, mergeHistories, summarizeValue } from "./dashboard.ts";
import { collectAllItems, collectItems } from "./items/collect.ts";
import type { TerminalOffer, TerminalOfferResponse } from "../src/lib/items/item.types.ts";
import { loadCatalog, readUInt32 } from "./items/catalog.ts";
import {
  DEFAULT_MARKETPLACE,
  LEGACY_HISTORY_MARKETPLACE,
  MARKETPLACES,
} from "../src/lib/settings/settings.config.ts";
import type { Marketplace } from "../src/lib/settings/settings.types.ts";
import { getPriceBook } from "./prices/prices.ts";
import {
  DEFAULT_CONTENT_TYPE,
  ENV,
  EXIT_CODE,
  IMMUTABLE_CACHE,
  JSON_CONTENT_TYPE,
  MIME_TYPES,
  NO_CACHE,
  readSettings,
  SECURITY_HEADERS,
  SERVER_LIMITS,
  SSE_HEADERS,
  STATIC_NOT_FOUND_BODY,
  TEXT_PLAIN,
} from "./server.config.ts";
import type { SnapshotTimers } from "./server.types.ts";
import { bootstrapAccounts } from "./accounts/accounts.bootstrap.ts";
import { createAccountManager } from "./accounts/account-manager.ts";
import { createSessionStore } from "./steam/session-store.ts";
import { createRealGateway } from "./steam/steam.real.ts";
import { UserFacingError, type StorageGateway } from "./steam/steam.types.ts";
import { computeTradeUp, listTradeUpCandidates, type TradeUpCandidate } from "./tradeup.ts";
import { buildSummaryReport } from "./report.ts";

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
const INDEX_FILE = "index.html";
const HEALTH_PATH = "/healthz";
const VARY_HEADER = "accept-encoding";
// eslint-disable-next-line no-control-regex -- rejecting control characters is the point
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/;
const ITEM_ID_PATTERN = /^(\d{1,20}|inventory)$/;
const TRACKED_SCOPES_KEY = "pref:price-scopes";

const settings = readSettings();
const db = openDatabase(settings.dataDir);
const catalog = await loadCatalog(db);
const sessions = createSessionStore(settings.dataDir);
const saved = bootstrapAccounts(db, sessions);
const accounts = createAccountManager({
  db,
  sessions,
  saved,
  createGateway: (session) =>
    createRealGateway(db, sessions, (raw) => catalog.describe(raw).view.name, session),
});
const historySync = createHistorySync(db, (steamId, refresh) =>
  accounts.get(steamId).getWebCookies(refresh),
);
const caseStats = createCaseStatsCache(db);

/** Writes `payload`, gzipped when worthwhile. Skips dead sockets and never rejects. */
async function sendBody(
  res: ServerResponse,
  status: number,
  headers: Record<string, string>,
  payload: Buffer,
): Promise<void> {
  const contentType = headers["content-type"] ?? "";
  const { body, encoding } = await encodeBody(
    payload,
    contentType,
    res.req.headers["accept-encoding"],
  );
  if (res.destroyed || res.headersSent) return;
  res.writeHead(status, {
    ...headers,
    vary: VARY_HEADER,
    "content-length": body.length,
    ...(encoding ? { "content-encoding": encoding } : {}),
  });
  res.end(body);
}

async function sendJson(res: ServerResponse, status: number, body: unknown): Promise<void> {
  await sendBody(
    res,
    status,
    { "content-type": JSON_CONTENT_TYPE },
    Buffer.from(JSON.stringify(body)),
  );
}

/** True once the client has gone away; nothing more should be written. */
function aborted(req: IncomingMessage, res: ServerResponse): boolean {
  return req.destroyed || res.destroyed;
}

function sendError(res: ServerResponse, error: unknown): void {
  const status = error instanceof UserFacingError ? error.status : HTTP.serverError;
  const message = error instanceof UserFacingError ? error.message : "Internal error";
  if (!(error instanceof UserFacingError)) console.error(error);
  void sendJson(res, status, { error: message } satisfies ApiError);
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

function asRecord(body: unknown): Record<string, unknown> {
  return typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
}

/** The account a state-changing request acts on. There is deliberately no default: a move must name its account. */
function parseAccountId(body: unknown): string {
  const { accountId } = asRecord(body);
  if (typeof accountId !== "string" || !STEAM_ID_PATTERN.test(accountId))
    throw new UserFacingError("Choose an account for this request", HTTP.badRequest);
  return accountId;
}

type AccountScope = { readonly kind: "one"; readonly steamId: string } | { readonly kind: "all" };

/** `?account=<steamId>`, or `all` for the read-only views that can combine accounts. */
function parseAccountScope(url: URL, allowAll: boolean): AccountScope {
  const value = url.searchParams.get("account");
  if (value === ALL_ACCOUNTS && allowAll) return { kind: "all" };
  if (value === null || !STEAM_ID_PATTERN.test(value))
    throw new UserFacingError("Choose an account for this request", HTTP.badRequest);
  return { kind: "one", steamId: value };
}

function parseTransferRequest(body: unknown): TransferRequest {
  const accountId = parseAccountId(body);
  const record = asRecord(body);
  const { from, to, itemIds } = record;
  const isId = (value: unknown): value is string =>
    typeof value === "string" && ITEM_ID_PATTERN.test(value);
  if (!isId(from) || !isId(to) || !Array.isArray(itemIds) || !itemIds.every(isId)) {
    throw new UserFacingError("Invalid transfer request", HTTP.badRequest);
  }
  return { accountId, from, to, itemIds };
}

function parseActivateRequest(body: unknown): ActivateTerminalRequest {
  const accountId = parseAccountId(body);
  const { id } = asRecord(body);
  if (typeof id !== "string" || !ITEM_ID_PATTERN.test(id)) {
    throw new UserFacingError("Invalid activation request", HTTP.badRequest);
  }
  return { accountId, id };
}

function parseRenameRequest(body: unknown): RenameUnitRequest {
  const accountId = parseAccountId(body);
  const { id, name } = asRecord(body);
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
  return { accountId, id, name: trimmed };
}

function parseLabel(body: unknown): AccountLabel | null {
  const { label } = asRecord(body);
  if (label === null) return null;
  const known = ACCOUNT_LABELS.find((candidate) => candidate === label);
  if (!known) throw new UserFacingError("Unknown account label", HTTP.badRequest);
  return known;
}

function singleAccount(scope: AccountScope): { readonly steamId: string } {
  if (scope.kind === "all") throw new UserFacingError("Choose one account", HTTP.badRequest);
  return scope;
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

/** The account's gateway once it has synced; connects it on first use. */
function readyGateway(steamId: string): StorageGateway {
  const gateway = accounts.get(steamId);
  if (gateway.getSnapshot().auth.status !== "ready")
    throw new UserFacingError("That account isn't connected yet", HTTP.conflict);
  return gateway;
}

/** Gateways of every account that is connected right now; the others are skipped, not waited for. */
function readyGateways(): StorageGateway[] {
  return accounts
    .all()
    .map(({ gateway }) => gateway)
    .filter((gateway) => gateway.getSnapshot().auth.status === "ready");
}

/** Persists a value snapshot at most once per interval so the dashboard can chart history. */
const snapshotsInFlight = new Set<string>();

async function recordSnapshot(gateway: StorageGateway, scope: PriceScope): Promise<void> {
  const steamId = gateway.getSteamId();
  const key = { steamId, currency: historyCurrency(scope) };
  const flightKey = `${steamId}:${key.currency}`;
  if (snapshotsInFlight.has(flightKey)) return;
  const last = db.lastSnapshotAt(key);
  if (last !== undefined && Date.now() - last < SERVER_LIMITS.snapshotIntervalMs) return;
  snapshotsInFlight.add(flightKey);
  try {
    await writeSnapshot(gateway, key, scope);
  } finally {
    snapshotsInFlight.delete(flightKey);
  }
}

async function writeSnapshot(
  gateway: StorageGateway,
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

/** Open SSE responses; they never go idle, so shutdown ends them explicitly. */
const eventStreams = new Set<ServerResponse>();

function handleEvents(req: IncomingMessage, res: ServerResponse): void {
  res.writeHead(HTTP.ok, SSE_HEADERS);
  eventStreams.add(res);
  const send = (snapshot: unknown) => {
    if (!res.writableEnded && !res.destroyed) res.write(`data: ${JSON.stringify(snapshot)}\n\n`);
  };
  send(accounts.getSnapshot());
  const unsubscribe = accounts.subscribe(send);
  const keepAlive = setInterval(() => {
    if (!res.writableEnded && !res.destroyed) res.write(": keep-alive\n\n");
  }, SSE_KEEP_ALIVE_MS);
  req.on("close", () => {
    clearInterval(keepAlive);
    unsubscribe();
    eventStreams.delete(res);
  });
}

function hasKnownMimeType(extension: string): extension is keyof typeof MIME_TYPES {
  return Object.hasOwn(MIME_TYPES, extension);
}

function contentTypeFor(file: string): string {
  const extension = extname(file).toLowerCase();
  return hasKnownMimeType(extension) ? MIME_TYPES[extension] : DEFAULT_CONTENT_TYPE;
}

async function serveStatic(webDir: string, pathname: string, res: ServerResponse): Promise<void> {
  const resolved = normalize(join(webDir, pathname));
  const inside = resolved === webDir || resolved.startsWith(webDir + sep);
  let file = inside ? resolved : join(webDir, INDEX_FILE);
  try {
    if ((await stat(file)).isDirectory()) file = join(file, INDEX_FILE);
  } catch {
    // A missing file (has an extension) is a real 404; extensionless routes fall back to the SPA shell.
    if (extname(pathname) !== "") {
      return await sendBody(
        res,
        HTTP.notFound,
        { "content-type": TEXT_PLAIN, "cache-control": NO_CACHE },
        Buffer.from(STATIC_NOT_FOUND_BODY),
      );
    }
    file = join(webDir, INDEX_FILE);
  }
  const body = await readFile(file);
  const isAsset = file.includes(`${sep}assets${sep}`);
  await sendBody(
    res,
    HTTP.ok,
    {
      "content-type": contentTypeFor(file),
      "cache-control": isAsset ? IMMUTABLE_CACHE : NO_CACHE,
    },
    body,
  );
}

const server = createServer(async (req, res) => {
  // Set before any branch so every response (health, auth challenge, SSE, static, errors) carries them.
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) res.setHeader(name, value);
  const url = new URL(req.url ?? "/", `http://${settings.host}`);
  const method = req.method ?? "GET";
  try {
    if (url.pathname === HEALTH_PATH) return void res.writeHead(HTTP.ok).end("ok");
    // A password already stops rebinding (the attacker's origin has no credentials).
    if (!settings.password && !isAllowedHost(req.headers.host, settings.allowedHosts)) {
      return void sendJson(res, HTTP.forbidden, {
        error: `Host not allowed. Add it to ${ENV.allowedHosts} or set ${ENV.password}.`,
      } satisfies ApiError);
    }
    if (!isAuthorized(req)) {
      res.writeHead(HTTP.unauthorized, {
        "www-authenticate": `Basic realm="${SERVER_LIMITS.basicAuthRealm}", charset="UTF-8"`,
      });
      return void res.end();
    }
    const path = url.pathname;
    if (path === STORAGE_API.events && method === "GET") return handleEvents(req, res);
    if (path === STORAGE_API.state && method === "GET")
      return sendJson(res, HTTP.ok, accounts.getSnapshot());

    if (path === STORAGE_API.items && method === "GET") {
      const account = parseAccountScope(url, true);
      const gateways = account.kind === "all" ? readyGateways() : [readyGateway(account.steamId)];
      const scope = parseScope(url);
      const { currency } = scope;
      const book = await loadPrices(scope);
      if (aborted(req, res)) return;
      const items = collectAllItems(gateways, catalog, book).map((c) => c.view);
      return sendJson(res, HTTP.ok, { items, currency, priceUpdatedAt: book.fetchedAt });
    }

    if (path === STORAGE_API.dashboard && method === "GET") {
      const account = parseAccountScope(url, true);
      const gateways = account.kind === "all" ? readyGateways() : [readyGateway(account.steamId)];
      const scope = parseScope(url);
      const { currency } = scope;
      rememberScope(scope);
      const book = await loadPrices(scope);
      if (aborted(req, res)) return;
      const items = collectAllItems(gateways, catalog, book).map((c) => c.view);
      const units = gateways.flatMap((gateway) => gateway.getSnapshot().units);
      for (const gateway of gateways)
        void recordSnapshot(gateway, scope).catch((e: unknown) => console.warn("[snapshot]", e));
      const series = gateways.map((gateway) =>
        db.listSnapshots({ steamId: gateway.getSteamId(), currency: historyCurrency(scope) }),
      );
      return sendJson(
        res,
        HTTP.ok,
        buildDashboard({
          items,
          history:
            series.length === 1
              ? (series[0] ?? [])
              : mergeHistories(series, SERVER_LIMITS.snapshotIntervalMs),
          currency,
          priceUpdatedAt: book.fetchedAt,
          unitsLoaded: units.filter((u) => u.loaded).length,
          unitsTotal: units.length,
        }),
      );
    }

    if (path === STORAGE_API.report && method === "GET") {
      const account = parseAccountScope(url, true);
      const gateways = account.kind === "all" ? readyGateways() : [readyGateway(account.steamId)];
      const scope = parseScope(url);
      const { currency } = scope;
      const book = await loadPrices(scope);
      if (aborted(req, res)) return;
      const items = collectAllItems(gateways, catalog, book).map((entry) => entry.view);
      const units = gateways.flatMap((gateway) => gateway.getSnapshot().units);
      const series = gateways.map((gateway) =>
        db.listSnapshots({ steamId: gateway.getSteamId(), currency: historyCurrency(scope) }),
      );
      const dashboard = buildDashboard({
        items,
        history:
          series.length === 1
            ? (series[0] ?? [])
            : mergeHistories(series, SERVER_LIMITS.snapshotIntervalMs),
        currency,
        priceUpdatedAt: book.fetchedAt,
        unitsLoaded: units.filter((unit) => unit.loaded).length,
        unitsTotal: units.length,
      });
      const report = buildSummaryReport({
        period: settings.reportPeriod,
        history: dashboard.history,
        holdings: dashboard.topHoldings,
        currency,
      });
      res.setHeader(
        "content-disposition",
        `attachment; filename=openinventory-${report.period}-report.json`,
      );
      return sendJson(res, HTTP.ok, report);
    }

    if (path === STORAGE_API.cases && method === "GET") {
      const { steamId } = singleAccount(parseAccountScope(url, false));
      readyGateway(steamId);
      historySync.start(steamId, { onlyIfStale: true });
      return sendJson(res, HTTP.ok, {
        stats: caseStats.get(steamId, parseOpeningKind(url)),
        sync: historySync.status(steamId),
      });
    }

    if ((path === STORAGE_API.tradeUp || path === STORAGE_API.tradeUpOdds) && method === "GET") {
      const gateway = readyGateway(singleAccount(parseAccountScope(url, false)).steamId);
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
      assertJsonBody(req);
      const body = await readBody(req);
      if (path === STORAGE_API.accountLogin) {
        await accounts.startLogin();
        return void res.writeHead(HTTP.noContent).end();
      }
      if (path === STORAGE_API.accountLoginCancel) {
        accounts.cancelLogin();
        return void res.writeHead(HTTP.noContent).end();
      }
      if (path === STORAGE_API.accountRemove) {
        accounts.remove(parseAccountId(body));
        return void res.writeHead(HTTP.noContent).end();
      }
      if (path === STORAGE_API.accountLabel) {
        accounts.setLabel(parseAccountId(body), parseLabel(body));
        return void res.writeHead(HTTP.noContent).end();
      }
      if (path === STORAGE_API.accountConnect) {
        accounts.get(parseAccountId(body));
        return void res.writeHead(HTTP.noContent).end();
      }
      if (path === STORAGE_API.accountReconnect) {
        accounts.get(parseAccountId(body)).reconnect();
        return void res.writeHead(HTTP.noContent).end();
      }
      if (path === STORAGE_API.transfer) {
        const request = parseTransferRequest(body);
        readyGateway(request.accountId).transferItems(request);
        return void res.writeHead(HTTP.accepted).end();
      }
      if (path === STORAGE_API.renameUnit) {
        const { accountId, id, name } = parseRenameRequest(body);
        await readyGateway(accountId).renameUnit(id, name);
        return void res.writeHead(HTTP.noContent).end();
      }
      if (path === STORAGE_API.activateTerminal) {
        const { accountId, id } = parseActivateRequest(body);
        const gateway = readyGateway(accountId);
        const raw = gateway.getInventory().find((item) => item.id === id);
        const terminal = raw ? catalog.describe(raw).view.terminal : null;
        if (!terminal) throw new UserFacingError("That item isn't a Terminal", HTTP.badRequest);
        if (terminal.isActive)
          throw new UserFacingError("That Terminal is already active", HTTP.conflict);
        await gateway.activateTerminal(id);
        return void res.writeHead(HTTP.noContent).end();
      }
      if (path === STORAGE_API.terminalOffer || path === STORAGE_API.terminalNextOffer) {
        const scope = parseScope(url);
        const { accountId, id } = parseActivateRequest(body);
        const gateway = readyGateway(accountId);
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
        const accountId = parseAccountId(body);
        readyGateway(accountId);
        historySync.start(accountId);
        return void res.writeHead(HTTP.accepted).end();
      }
      if (path === STORAGE_API.transferCancel) {
        accounts.get(parseAccountId(body)).cancelTransfer();
        return void res.writeHead(HTTP.noContent).end();
      }
      if (path === STORAGE_API.transferDismiss) {
        accounts.get(parseAccountId(body)).dismissTransfer();
        return void res.writeHead(HTTP.noContent).end();
      }
      if (path === STORAGE_API.refresh) {
        const gateway = readyGateway(parseAccountId(body));
        await loadPrices(parseScope(url), true);
        gateway.refreshUnits(true).catch((e: unknown) => console.warn("[units]", e));
        return void res.writeHead(HTTP.noContent).end();
      }
    }

    if (path.startsWith("/api/"))
      return sendJson(res, HTTP.notFound, { error: "Not found" } satisfies ApiError);
    if (method !== "GET" && method !== "HEAD")
      return sendJson(res, HTTP.methodNotAllowed, { error: "Method not allowed" });
    if (settings.webDir) return await serveStatic(settings.webDir, path, res);
    void sendJson(res, HTTP.notFound, { error: "Not found" } satisfies ApiError);
  } catch (error) {
    sendError(res, error);
  }
});

/** The stored scope ids, or undefined (after a warning) when the pref is corrupt. */
function parseStoredScopes(raw: string | undefined): string[] | undefined {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((e) => typeof e === "string")) return parsed;
    console.warn("[scopes] stored price scopes are corrupt: expected a string array");
  } catch (error) {
    console.warn("[scopes] stored price scopes are corrupt:", error);
  }
  return undefined;
}

/** Currency/marketplace pairs the dashboard has been viewed in; the background job records history for each. */
function trackedScopes(): PriceScope[] {
  const parsed = parseStoredScopes(db.getCacheStale(TRACKED_SCOPES_KEY));
  // A corrupt pref is treated as empty and reset, so the warning fires once rather than on every call.
  if (!parsed) db.setCache(TRACKED_SCOPES_KEY, JSON.stringify([]));
  const stored = parsed ?? [];
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
// (re)connect of an account, so each account's timers are only started once.
const snapshotTimers = new Map<string, SnapshotTimers>();

async function deliverScheduledReport(steamId: string, gateway: StorageGateway): Promise<void> {
  if (!settings.reportWebhookUrl) return;
  const now = new Date();
  const periodKey =
    settings.reportPeriod === "weekly"
      ? String(Math.floor(now.getTime() / (7 * 86_400_000)))
      : `${now.getUTCFullYear()}-${now.getUTCMonth() + 1}`;
  const markerKey = `report-webhook:${steamId}:${settings.reportPeriod}`;
  if (db.getCacheStale(markerKey) === periodKey) return;
  const scope = trackedScopes()[0];
  if (!scope) return;
  const book = await loadPrices(scope);
  const items = collectItems(gateway, catalog, book).map((entry) => entry.view);
  const units = gateway.getSnapshot().units;
  const dashboard = buildDashboard({
    items,
    history: db.listSnapshots({ steamId, currency: historyCurrency(scope) }),
    currency: scope.currency,
    priceUpdatedAt: book.fetchedAt,
    unitsLoaded: units.filter((unit) => unit.loaded).length,
    unitsTotal: units.length,
  });
  const report = buildSummaryReport({
    period: settings.reportPeriod,
    history: dashboard.history,
    holdings: dashboard.topHoldings,
    currency: scope.currency,
  });
  const response = await fetch(settings.reportWebhookUrl, {
    method: "POST",
    headers: { "content-type": JSON_CONTENT_TYPE },
    body: JSON.stringify(report),
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`Webhook returned HTTP ${response.status}`);
  db.setCache(markerKey, periodKey);
}

accounts.onReady((steamId, gateway) => {
  if (snapshotTimers.has(steamId)) return;
  const tick = () => {
    for (const scope of trackedScopes()) {
      void recordSnapshot(gateway, scope).catch((e: unknown) => console.warn("[snapshot]", e));
    }
  };
  const report = settings.reportWebhookUrl
    ? setInterval(() => {
        void deliverScheduledReport(steamId, gateway).catch((error: unknown) =>
          console.warn("[report] webhook delivery failed:", error),
        );
      }, SERVER_LIMITS.reportCheckIntervalMs)
    : undefined;
  report?.unref();
  snapshotTimers.set(steamId, {
    initial: setTimeout(tick, SERVER_LIMITS.snapshotInitialDelayMs),
    interval: setInterval(tick, SERVER_LIMITS.snapshotIntervalMs),
    report,
  });
});

// Only the first account connects at start (what a single-account install always did, so
// headless history keeps recording); the rest connect when first used.
const [firstAccount] = accounts.ids();
if (firstAccount) accounts.get(firstAccount);

server.listen(settings.port, settings.host, () => {
  console.log(
    `[openinventory] listening on http://${settings.host}:${settings.port} (data: ${settings.dataDir})`,
  );
});

let shuttingDown = false;

/**
 * Stops timers, ends SSE streams, lets in-flight responses finish, then forces
 * stragglers closed after the grace period. A second signal exits immediately.
 */
function shutdown(): void {
  if (shuttingDown) {
    console.warn("[openinventory] second signal, forcing exit");
    process.exit(EXIT_CODE.forced);
  }
  shuttingDown = true;
  for (const timers of snapshotTimers.values()) {
    clearTimeout(timers.initial);
    clearInterval(timers.interval);
    if (timers.report) clearInterval(timers.report);
  }
  for (const stream of eventStreams) stream.end();
  const force = setTimeout(() => server.closeAllConnections(), SERVER_LIMITS.shutdownGraceMs);
  force.unref();
  server.close(() => {
    clearTimeout(force);
    db.close();
    process.exit(EXIT_CODE.clean);
  });
  server.closeIdleConnections();
}

for (const signal of ["SIGINT", "SIGTERM"] as const) process.on(signal, shutdown);
