/// <reference path="./globaloffensive.d.ts" />
import GlobalOffensive from "globaloffensive";
import QRCode from "qrcode";
import { EAuthTokenPlatformType, LoginSession } from "steam-session";
import SteamUser from "steam-user";
import {
  AUTH_STATUS,
  CASKET_NOTIFICATION,
  CS2_APP_ID,
  FINAL_OFFER_POINTS,
  GC_ATTRIBUTE,
  GC_MESSAGE,
  ITEM_DEF,
  STORAGE_LIMITS,
  SESSION_REPLACED_ERESULT,
  SESSION_REPLACED_MESSAGE,
  TOKEN_REJECTED_ERESULTS,
  UNLOCK_CRATE_NOTIFICATION,
} from "../../src/lib/storage/storage.config.ts";
import type { Database } from "../db/db.types.ts";
import { createSessionFile, type SavedSession } from "./session-file.ts";
import { createSnapshotStore, type UnitMeta } from "./steam.store.ts";
import { INVENTORY_LOCATION_ID } from "../../src/lib/items/item.types.ts";
import type { TransferRequest } from "../../src/lib/storage/storage.types.ts";
import { isPlaceholderItemId } from "./item-ids.ts";
import { encodeNameItem } from "./rename.ts";
import { encodeRequestOffer, encodeLoadTerminalOffer, encodeOpenCrate } from "./terminal.ts";
import { runTransfer } from "./transfer.ts";
import {
  UserFacingError,
  type GcItem,
  type StorageGateway,
  type UnitContents,
} from "./steam.types.ts";

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Steam sign-in -> CS2 Game Coordinator session -> inventory -> storage unit
 * contents, plus moves between the inventory and units. Unit contents are copied at
 * load time (the GC evicts a unit's items when another loads) and persisted.
 */
export function createRealGateway(
  db: Database,
  dataDir: string,
  nameOf: (item: GcItem) => string,
): StorageGateway {
  const store = createSnapshotStore();
  const sessionFile = createSessionFile(dataDir);
  const unitContents = new Map<string, readonly GcItem[]>();
  const readyListeners: ((steamId: string) => void)[] = [];
  let login: LoginSession | undefined;
  let steam: SteamUser | undefined;
  let csgo: GlobalOffensive | undefined;
  let gcTimeout: NodeJS.Timeout | undefined;
  let steamId: string | undefined;
  /** Kept across reconnects; only cleared on sign-out or a rejected token. */
  let activeSession: SavedSession | undefined;
  /** Steam Community cookies for the current connection; refreshed on demand. */
  let webCookies: readonly string[] | undefined;
  let reconnectTimer: NodeJS.Timeout | undefined;
  let reconnectAttempts = 0;
  let unitRefreshTimer: NodeJS.Timeout | undefined;
  let gcConnected = false;
  /** The GC library mishandles overlapping casket loads, so run them one at a time. */
  let loadQueue: Promise<unknown> = Promise.resolve();

  function readUnitMeta(): UnitMeta[] {
    return (csgo?.inventory ?? [])
      .filter((item) => item.def_index === ITEM_DEF.storageUnit)
      .map((item) => ({
        id: item.id,
        name: item.custom_name ?? `Storage Unit ${item.id.slice(-4)}`,
        itemCount: item.casket_contained_item_count ?? 0,
      }));
  }

  /** Drops the live Steam/GC connection but keeps the saved login for a reconnect. */
  function teardownConnection(): void {
    clearTimeout(gcTimeout);
    clearTimeout(unitRefreshTimer);
    csgo?.removeAllListeners();
    csgo = undefined;
    gcConnected = false;
    steam?.logOff();
    steam?.removeAllListeners();
    steam = undefined;
    webCookies = undefined;
  }

  function teardown(): void {
    clearTimeout(reconnectTimer);
    reconnectAttempts = 0;
    unitContents.clear();
    login?.cancelLoginAttempt();
    login = undefined;
    teardownConnection();
    activeSession = undefined;
    steamId = undefined;
  }

  function fail(message: string): void {
    teardown();
    store.reset();
    store.setAuth({ status: AUTH_STATUS.error, message });
  }

  /** The GC's "contents loaded" notice can precede the item records, so wait for the full count. */
  async function collectLoadedItems(
    gc: GlobalOffensive,
    unitId: string,
    expected: number,
  ): Promise<readonly GcItem[]> {
    const deadline = Date.now() + STORAGE_LIMITS.contentsSettleMs;
    const read = () => (gc.inventory ?? []).filter((item) => item.casket_id === unitId);
    while (read().length < expected && Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, STORAGE_LIMITS.contentsPollMs));
    }
    return [...read()];
  }

  async function loadUnit(gc: GlobalOffensive, unit: UnitMeta): Promise<void> {
    if (!gc.haveGCSession || steamId === undefined) return;
    if (unit.itemCount > 0) {
      await new Promise<void>((resolve, reject) => {
        gc.getCasketContents(unit.id, (error) => (error ? reject(error) : resolve()));
      });
    }
    const items = unit.itemCount > 0 ? await collectLoadedItems(gc, unit.id, unit.itemCount) : [];
    unitContents.set(unit.id, items);
    db.saveUnit(steamId, unit.id, unit.itemCount, items);
    store.markLoaded(unit.id);
  }

  function refreshUnits(force: boolean): Promise<void> {
    const run = loadQueue.then(async () => {
      const gc = csgo;
      const current = steamId;
      if (!gc || !current) return;
      const units = store.units();
      const cached = db.loadUnits(current);
      store.setLoadingUnits(true);
      try {
        for (const unit of units) {
          const hit = cached.get(unit.id);
          if (!force && hit && hit.itemCount === unit.itemCount && unitContents.has(unit.id))
            continue;
          try {
            await loadUnit(gc, unit);
          } catch (error) {
            console.warn(`[units] could not load ${unit.name}:`, toErrorMessage(error));
          }
        }
      } finally {
        store.setLoadingUnits(false);
      }
    });
    loadQueue = run.catch(() => undefined);
    return run;
  }

  function restoreCachedUnits(current: string): void {
    const cached = db.loadUnits(current);
    for (const [unitId, entry] of cached) {
      unitContents.set(unitId, entry.items);
      store.markLoaded(unitId);
    }
  }

  /** Keeps the token and retries with exponential backoff (e.g. "logged in elsewhere", network loss). */
  function scheduleReconnect(reason: string): void {
    const session = activeSession;
    if (!session) return;
    teardownConnection();
    const delay = Math.min(
      STORAGE_LIMITS.reconnectMaxMs,
      STORAGE_LIMITS.reconnectBaseMs * 2 ** reconnectAttempts,
    );
    reconnectAttempts += 1;
    store.setAuth({
      status: AUTH_STATUS.connecting,
      detail: `${reason} Retrying in ${Math.round(delay / 1000)}s…`,
    });
    clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(() => connect(session), delay);
  }

  function startGcTimeout(): void {
    clearTimeout(gcTimeout);
    gcTimeout = setTimeout(
      () => scheduleReconnect("Timed out waiting for the CS2 Game Coordinator."),
      STORAGE_LIMITS.gcConnectTimeoutMs,
    );
  }

  function connect(session: SavedSession): void {
    const { refreshToken, steamId: id } = session;
    activeSession = session;
    let displayName: string | null = session.displayName ?? null;
    store.setAuth({ status: AUTH_STATUS.connecting, detail: "Connecting to Steam…" });
    const client = new SteamUser({ autoRelogin: true });
    steam = client;
    steamId = id;
    startGcTimeout();
    // The persona name is what Steam shows to friends; the login name stays server-side.
    client.on("accountInfo", (name: string) => {
      const persona = name.trim();
      if (!persona) return;
      displayName = persona;
      if (activeSession && activeSession.displayName !== persona) {
        activeSession = { ...activeSession, displayName: persona };
        sessionFile.save(activeSession);
      }
      if (gcConnected) store.setAuth({ status: AUTH_STATUS.ready, displayName });
    });
    client.on("webSession", (_sessionId: string, cookies: string[]) => {
      webCookies = cookies;
    });
    client.on("error", (error: Error & { eresult?: number }) => {
      if (error.eresult !== undefined && TOKEN_REJECTED_ERESULTS.includes(error.eresult)) {
        sessionFile.clear();
        fail(`Steam rejected the saved login (${error.message}). Sign in again.`);
        return;
      }
      // Retrying would just kick the other client back and the two would fight forever.
      if (error.eresult === SESSION_REPLACED_ERESULT) {
        fail(SESSION_REPLACED_MESSAGE);
        return;
      }
      // Everything else (network, throttling) keeps the token.
      scheduleReconnect(`Steam connection lost (${error.message}).`);
    });
    // Never force the session: if CS2 is running elsewhere we stay logged on and idle.
    client.on("playingState", (blocked: boolean, playingApp: number) => {
      if (blocked) {
        clearTimeout(gcTimeout);
        if (!gcConnected) {
          store.setAuth({
            status: AUTH_STATUS.connecting,
            detail: "CS2 is running on another device. OpenInventory will connect when it closes.",
          });
        }
        return;
      }
      if (playingApp !== CS2_APP_ID) {
        if (!gcConnected) startGcTimeout();
        client.gamesPlayed([CS2_APP_ID]);
      }
    });
    client.on("loggedOn", () => {
      reconnectAttempts = 0;
      // autoRelogin re-fires loggedOn; keep a single GC instance per client.
      if (csgo) return client.gamesPlayed([CS2_APP_ID]);
      store.setAuth({ status: AUTH_STATUS.connecting, detail: "Connecting to CS2…" });
      const gc = new GlobalOffensive(client);
      csgo = gc;
      gc.on("connectedToGC", () => {
        gcConnected = true;
        clearTimeout(gcTimeout);
        const units = readUnitMeta();
        db.pruneUnits(
          id,
          units.map((unit) => unit.id),
        );
        store.setUnits(units);
        restoreCachedUnits(id);
        store.setAuth({ status: AUTH_STATUS.ready, displayName });
        for (const listener of readyListeners) listener(id);
        void refreshUnits(false);
      });
      gc.on("disconnectedFromGC", () => {
        gcConnected = false;
      });
      // A changed unit (count or contents moved in-game) needs a debounced reload; other items just bump the revision.
      const onItem = (item: GcItem) => {
        if (item.def_index !== ITEM_DEF.storageUnit) return store.touch();
        store.setUnits(readUnitMeta());
        clearTimeout(unitRefreshTimer);
        unitRefreshTimer = setTimeout(
          () => void refreshUnits(false),
          STORAGE_LIMITS.unitRefreshDebounceMs,
        );
      };
      gc.on("itemAcquired", onItem);
      gc.on("itemRemoved", onItem);
      gc.on("itemChanged", (_old: GcItem, next: GcItem) => onItem(next));
      client.gamesPlayed([CS2_APP_ID]);
    });
    client.logOn({ refreshToken });
  }

  /** Cookies for steamcommunity.com, requested from the live connection when missing or stale. */
  function getWebCookies(refresh: boolean): Promise<readonly string[]> {
    const client = steam;
    if (!client) return Promise.reject(new UserFacingError("Not connected to Steam.", 409));
    if (webCookies && !refresh) return Promise.resolve(webCookies);
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        client.removeListener("webSession", onSession);
        reject(new UserFacingError("Steam did not provide a web session in time.", 504));
      }, STORAGE_LIMITS.webSessionTimeoutMs);
      const onSession = (_sessionId: string, cookies: string[]) => {
        clearTimeout(timer);
        resolve(cookies);
      };
      client.once("webSession", onSession);
      client.webLogOn();
    });
  }

  function renameUnit(unitId: string, name: string): Promise<void> {
    const gc = csgo;
    const client = steam;
    if (!gc || !client || !gc.haveGCSession) {
      throw new UserFacingError("Not connected to the CS2 Game Coordinator", STATUS.conflict);
    }
    if (!store.units().some((unit) => unit.id === unitId))
      throw new UserFacingError("Storage unit not found", STATUS.notFound);
    return new Promise<void>((resolve, reject) => {
      const done = (error?: Error) => {
        clearTimeout(timer);
        gc.off("itemChanged", onChanged);
        if (error) reject(error);
        else resolve();
      };
      const onChanged = (_old: GcItem, next: GcItem) => {
        if (next.id === unitId && next.custom_name === name) done();
      };
      const timer = setTimeout(
        () => done(new UserFacingError("Steam didn't confirm the rename", STATUS.conflict)),
        STORAGE_LIMITS.renameConfirmTimeoutMs,
      );
      gc.on("itemChanged", onChanged);
      client.sendToGC(CS2_APP_ID, GC_MESSAGE.nameItem, {}, encodeNameItem(unitId, name));
    });
  }

  function activateTerminal(terminalId: string): Promise<void> {
    const gc = csgo;
    const client = steam;
    if (!gc || !client || !gc.haveGCSession) {
      throw new UserFacingError("Not connected to the CS2 Game Coordinator", STATUS.conflict);
    }
    if (!looseInventory().some((item) => item.id === terminalId))
      throw new UserFacingError("Terminal not found in your inventory", STATUS.notFound);
    return new Promise<void>((resolve, reject) => {
      const done = (error?: Error) => {
        clearTimeout(timer);
        gc.off("itemChanged", onChanged);
        gc.off("itemCustomizationNotification", onNotification);
        if (error) reject(error);
        else resolve();
      };
      const onNotification = (_itemIds: readonly string[], type: number) => {
        if (type === UNLOCK_CRATE_NOTIFICATION) done();
      };
      const onChanged = (_old: GcItem, next: GcItem) => {
        const expiry = next.attribute?.some((a) => a.def_index === GC_ATTRIBUTE.expirationDate);
        if (next.id === terminalId && expiry) done();
      };
      const timer = setTimeout(
        () => done(new UserFacingError("Steam didn't confirm the activation", STATUS.conflict)),
        STORAGE_LIMITS.activateConfirmTimeoutMs,
      );
      gc.on("itemChanged", onChanged);
      gc.on("itemCustomizationNotification", onNotification);
      client.sendToGC(CS2_APP_ID, GC_MESSAGE.openCrate, {}, encodeOpenCrate(terminalId));
    });
  }

  /** What an active Terminal currently offers, newest first (older offers can linger in the inventory). */
  function offeredBy(terminalId: string): readonly GcItem[] {
    return (csgo?.inventory ?? [])
      .filter((item) => item.casket_id === terminalId)
      .sort((a, b) => (BigInt(a.id) < BigInt(b.id) ? 1 : -1));
  }

  /** The Terminal's points counter; undefined until its first offer exists. */
  function terminalPoints(terminalId: string): number | undefined {
    const terminal = looseInventory().find((item) => item.id === terminalId);
    if (!terminal)
      throw new UserFacingError("Terminal not found in your inventory", STATUS.notFound);
    const bytes = terminal.attribute?.find(
      (a) => a.def_index === GC_ATTRIBUTE.questPointsRemaining,
    )?.value_bytes;
    return bytes && bytes.length >= 4 ? bytes.readUInt32LE(0) : undefined;
  }

  /** Sends one offer message and resolves with the Terminal's offered items once the GC reports them. */
  function requestOffer(
    terminalId: string,
    send: (client: SteamUser) => void,
  ): Promise<readonly GcItem[]> {
    const gc = csgo;
    const client = steam;
    if (!gc || !client || !gc.haveGCSession) {
      throw new UserFacingError("Not connected to the CS2 Game Coordinator", STATUS.conflict);
    }
    return new Promise<readonly GcItem[]>((resolve, reject) => {
      const done = (error?: Error) => {
        clearTimeout(timer);
        gc.off("itemCustomizationNotification", onNotification);
        if (error) reject(error);
        else resolve(offeredBy(terminalId));
      };
      const onNotification = (itemIds: readonly string[], type: number) => {
        if (itemIds[0] === terminalId && type === CASKET_NOTIFICATION.contents) done();
      };
      const timer = setTimeout(
        () => done(new UserFacingError("Steam didn't send the offer", STATUS.conflict)),
        STORAGE_LIMITS.offerTimeoutMs,
      );
      gc.on("itemCustomizationNotification", onNotification);
      send(client);
    });
  }

  function getTerminalOffer(terminalId: string): Promise<readonly GcItem[]> {
    const points = terminalPoints(terminalId);
    const existing = offeredBy(terminalId);
    if (existing.length > 0) return Promise.resolve(existing);
    // No points yet means the first offer was never generated; otherwise just load it.
    return requestOffer(terminalId, (client) =>
      points === undefined
        ? client.sendToGC(CS2_APP_ID, GC_MESSAGE.openCrate, {}, encodeRequestOffer(terminalId, 0))
        : client.sendToGC(
            CS2_APP_ID,
            GC_MESSAGE.loadTerminalOffer,
            {},
            encodeLoadTerminalOffer(terminalId, points),
          ),
    );
  }

  function requestNextOffer(terminalId: string): Promise<readonly GcItem[]> {
    const points = terminalPoints(terminalId);
    if (points === undefined)
      throw new UserFacingError("This Terminal has no offer yet", STATUS.conflict);
    if (points === FINAL_OFFER_POINTS)
      throw new UserFacingError("This is the final offer", STATUS.conflict);
    return requestOffer(terminalId, (client) =>
      client.sendToGC(CS2_APP_ID, GC_MESSAGE.openCrate, {}, encodeRequestOffer(terminalId, points)),
    );
  }

  let transferCancelled = false;

  const STATUS = { badRequest: 400, notFound: 404, conflict: 409 } as const;

  function locationName(id: string): string | undefined {
    return id === INVENTORY_LOCATION_ID
      ? "Inventory"
      : store.units().find((unit) => unit.id === id)?.name;
  }

  /** Items you actually hold outside storage units: no units, no unit contents, no GC placeholders. */
  function looseInventory(): readonly GcItem[] {
    return (csgo?.inventory ?? []).filter(
      (item) =>
        item.def_index !== ITEM_DEF.storageUnit &&
        item.casket_id === undefined &&
        !isPlaceholderItemId(item.id),
    );
  }

  function itemsAt(location: string): readonly GcItem[] | undefined {
    if (location === INVENTORY_LOCATION_ID) {
      return looseInventory();
    }
    return unitContents.get(location);
  }

  /** Re-reads a unit after a move, expecting an exact count so we don't wait on a stale attribute. */
  async function reloadAfterMove(
    gc: GlobalOffensive,
    unitId: string,
    expected: number,
  ): Promise<void> {
    const meta = store.units().find((unit) => unit.id === unitId);
    if (!meta) return;
    await loadUnit(gc, { ...meta, itemCount: expected });
  }

  function transferItems(request: TransferRequest): void {
    const gc = csgo;
    if (!gc || !gc.haveGCSession || steamId === undefined) {
      throw new UserFacingError("Not connected to the CS2 Game Coordinator", STATUS.conflict);
    }
    if (store.getTransfer().status === "running")
      throw new UserFacingError("A transfer is already running", STATUS.conflict);
    const { from, to } = request;
    const itemIds = [...new Set(request.itemIds)];
    if (itemIds.length === 0 || itemIds.length > STORAGE_LIMITS.maxItemsPerTransfer) {
      throw new UserFacingError(
        `Select between 1 and ${STORAGE_LIMITS.maxItemsPerTransfer} items`,
        STATUS.badRequest,
      );
    }
    if (from === to)
      throw new UserFacingError("Source and destination are the same", STATUS.badRequest);
    const fromName = locationName(from);
    const toName = locationName(to);
    if (!fromName || !toName) throw new UserFacingError("Storage unit not found", STATUS.notFound);

    const source = itemsAt(from);
    if (!source)
      throw new UserFacingError("That storage unit hasn't finished loading yet", STATUS.conflict);
    const byId = new Map(source.map((item) => [item.id, item]));
    if (itemIds.some((id) => !byId.has(id))) {
      throw new UserFacingError(
        "Some of those items are no longer in the source. Refresh and try again.",
        STATUS.conflict,
      );
    }
    const destinationCount =
      to === INVENTORY_LOCATION_ID
        ? 0
        : (unitContents.get(to)?.length ?? store.units().find((u) => u.id === to)?.itemCount ?? 0);
    if (
      to !== INVENTORY_LOCATION_ID &&
      destinationCount + itemIds.length > STORAGE_LIMITS.unitCapacity
    ) {
      throw new UserFacingError(
        `${toName} can hold ${STORAGE_LIMITS.unitCapacity - destinationCount} more items`,
        STATUS.badRequest,
      );
    }
    const sourceCount = source.length;

    transferCancelled = false;
    store.setTransfer({ status: "running", total: itemIds.length, done: 0, fromName, toName });
    const run = loadQueue.then(async () => {
      const outcome = await runTransfer({
        gc,
        from,
        to,
        itemIds,
        nameOf: (id) => {
          const raw = byId.get(id);
          return raw ? nameOf(raw) : id;
        },
        onProgress: (done) =>
          store.setTransfer({ status: "running", total: itemIds.length, done, fromName, toName }),
        isCancelled: () => transferCancelled,
      });
      // Resync both ends from the GC so cached contents and counts are authoritative.
      try {
        if (from !== INVENTORY_LOCATION_ID)
          await reloadAfterMove(gc, from, sourceCount - outcome.done);
        if (to !== INVENTORY_LOCATION_ID)
          await reloadAfterMove(gc, to, destinationCount + outcome.done);
      } catch (error) {
        console.warn("[transfer] resync failed:", toErrorMessage(error));
      }
      store.setTransfer({
        status: "finished",
        total: itemIds.length,
        done: outcome.done,
        fromName,
        toName,
        cancelled: outcome.cancelled,
        failures: outcome.failures,
      });
    });
    loadQueue = run.catch(() => undefined);
    void run.catch((error: unknown) => {
      console.error("[transfer] failed:", error);
      store.setTransfer({
        status: "finished",
        total: itemIds.length,
        done: 0,
        fromName,
        toName,
        cancelled: false,
        failures: [{ itemId: "", name: "Transfer", reason: toErrorMessage(error) }],
      });
    });
  }

  const saved = sessionFile.load();
  if (saved) connect(saved);

  return {
    getSnapshot: () => store.getSnapshot(),
    subscribe: (listener) => store.subscribe(listener),
    onReady: (listener) => void readyListeners.push(listener),
    getSteamId: () => steamId,
    getWebCookies,

    async startQrLogin() {
      teardown();
      store.reset();
      const session = new LoginSession(EAuthTokenPlatformType.SteamClient);
      session.loginTimeout = STORAGE_LIMITS.qrLoginTimeoutMs;
      login = session;
      // steam-session keeps its login timer running after `authenticated`, so
      // timeout/error must only count while this attempt is still pending.
      const isPending = () => login === session;
      session.on("timeout", () => {
        if (isPending()) fail("QR login timed out. Start again.");
      });
      session.on("error", (error: Error) => {
        if (isPending()) fail(`Login failed: ${error.message}`);
      });
      session.on("authenticated", () => {
        const { accountName, steamID, refreshToken } = session;
        login = undefined;
        session.cancelLoginAttempt();
        const id = steamID.getSteamID64();
        sessionFile.save({ refreshToken, accountName, steamId: id });
        connect({ refreshToken, accountName, steamId: id });
      });
      try {
        const { qrChallengeUrl } = await session.startWithQR();
        if (!qrChallengeUrl) throw new Error("Steam did not return a QR challenge");
        const qrSvg = await QRCode.toString(qrChallengeUrl, { type: "svg", margin: 1 });
        store.setAuth({ status: AUTH_STATUS.qrPending, qrSvg });
        // Fired once the QR code has been scanned; the user still has to approve.
        session.on("remoteInteraction", () =>
          store.setAuth({
            status: AUTH_STATUS.connecting,
            detail: "Approve the sign-in in the Steam app…",
          }),
        );
      } catch (error) {
        fail(`Could not start Steam QR login: ${toErrorMessage(error)}`);
      }
    },

    logout() {
      const id = steamId;
      teardown();
      store.reset();
      sessionFile.clear();
      if (id) db.clearUnits(id);
    },

    getInventory: looseInventory,

    getUnits(): readonly UnitContents[] {
      return store
        .units()
        .filter((unit) => unitContents.has(unit.id))
        .map((unit) => ({ id: unit.id, name: unit.name, items: unitContents.get(unit.id) ?? [] }));
    },

    refreshUnits,
    renameUnit,
    activateTerminal,
    getTerminalOffer,
    requestNextOffer,
    transferItems,
    cancelTransfer: () => {
      transferCancelled = true;
    },
    dismissTransfer: () => {
      if (store.getTransfer().status === "finished") store.setTransfer({ status: "idle" });
    },
  };
}
