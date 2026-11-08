import type { AccountLabel } from "../../src/lib/accounts/accounts.types.ts";
import { AUTH_STATUS } from "../../src/lib/storage/storage.config.ts";
import type {
  AccountState,
  AppSnapshot,
  LoginResult,
} from "../../src/lib/storage/storage.types.ts";
import type { Database } from "../db/db.types.ts";
import type { SavedSession } from "../steam/session-file.ts";
import type { SessionStore } from "../steam/session-store.ts";
import { UserFacingError, type StorageGateway } from "../steam/steam.types.ts";
import { createQrLogin } from "./qr-login.ts";

const STATUS = { notFound: 404 } as const;

export type AccountManagerOptions = {
  readonly db: Database;
  readonly sessions: SessionStore;
  /** Builds the connection for one account. It must not touch Steam until `ensureConnected`. */
  readonly createGateway: (session: SavedSession) => StorageGateway;
  /** Saved logins found on disk at start, oldest first. */
  readonly saved: readonly SavedSession[];
};

export type ReadyListener = (steamId: string, gateway: StorageGateway) => void;

/** One Steam/GC connection per account, created for every saved login and connected on first use. */
export function createAccountManager({
  db,
  sessions,
  createGateway,
  saved,
}: AccountManagerOptions) {
  const gateways = new Map<string, StorageGateway>();
  const unsubscribers = new Map<string, () => void>();
  const sessionNames = new Map<string, string>();
  const readyListeners: ReadyListener[] = [];
  const listeners = new Set<(snapshot: AppSnapshot) => void>();
  let revision = 0;
  let emitScheduled = false;
  let lastLogin: LoginResult | null = null;

  const login = createQrLogin((session) => void adopt(session));
  login.subscribe(() => emit());

  function emit(): void {
    revision += 1;
    if (emitScheduled) return;
    emitScheduled = true;
    setImmediate(() => {
      emitScheduled = false;
      const snapshot = getSnapshot();
      for (const listener of listeners) listener(snapshot);
    });
  }

  function attach(session: SavedSession): StorageGateway {
    const gateway = createGateway(session);
    gateways.set(session.steamId, gateway);
    if (session.displayName) sessionNames.set(session.steamId, session.displayName);
    unsubscribers.set(
      session.steamId,
      gateway.subscribe(() => emit()),
    );
    gateway.onReady(() => {
      for (const listener of readyListeners) listener(session.steamId, gateway);
    });
    return gateway;
  }

  /** A QR login finished: store the token, register the account and connect it (or reconnect with the new token). */
  async function adopt(session: SavedSession): Promise<void> {
    const existing = gateways.get(session.steamId);
    lastLogin = {
      sequence: (lastLogin?.sequence ?? 0) + 1,
      steamId: session.steamId,
      added: existing === undefined,
    };
    existing?.disconnect();
    unsubscribers.get(session.steamId)?.();
    sessions.forAccount(session.steamId).save(session);
    db.addAccount(session.steamId);
    attach(session).ensureConnected();
    emit();
  }

  for (const session of saved) {
    db.addAccount(session.steamId);
    attach(session);
  }

  function gatewayFor(steamId: string): StorageGateway {
    const gateway = gateways.get(steamId);
    if (!gateway || !db.listAccounts().some((a) => a.steamId === steamId))
      throw new UserFacingError("Unknown account", STATUS.notFound);
    return gateway;
  }

  function getSnapshot(): AppSnapshot {
    const accounts: AccountState[] = [];
    for (const account of db.listAccounts()) {
      const gateway = gateways.get(account.steamId);
      if (!gateway) continue;
      const snapshot = gateway.getSnapshot();
      accounts.push({
        ...account,
        displayName:
          snapshot.auth.status === AUTH_STATUS.ready && snapshot.auth.displayName
            ? snapshot.auth.displayName
            : (sessionNames.get(account.steamId) ?? null),
        snapshot,
      });
    }
    return { accounts, login: login.getState(), lastLogin, revision };
  }

  return {
    getSnapshot,
    subscribe(listener: (snapshot: AppSnapshot) => void): () => void {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    /** The account's gateway, connecting it first if this is the first use. Throws for unknown ids. */
    get(steamId: string): StorageGateway {
      const gateway = gatewayFor(steamId);
      gateway.ensureConnected();
      return gateway;
    },
    /** Every tracked account's gateway (connecting each), for read-only aggregate views. */
    all(): readonly { readonly steamId: string; readonly gateway: StorageGateway }[] {
      return db.listAccounts().map(({ steamId }) => {
        const gateway = gatewayFor(steamId);
        gateway.ensureConnected();
        return { steamId, gateway };
      });
    },
    ids: (): readonly string[] => db.listAccounts().map((a) => a.steamId),
    onReady: (listener: ReadyListener): void => void readyListeners.push(listener),
    startLogin: () => login.start(),
    cancelLogin: () => login.cancel(),
    setLabel(steamId: string, label: AccountLabel | null): void {
      if (!db.setAccountLabel(steamId, label))
        throw new UserFacingError("Unknown account", STATUS.notFound);
      emit();
    },
    /** Signs the account out and stops tracking it. Its value and case history stay in the database. */
    remove(steamId: string): void {
      const gateway = gatewayFor(steamId);
      gateway.logout();
      unsubscribers.get(steamId)?.();
      unsubscribers.delete(steamId);
      gateways.delete(steamId);
      sessionNames.delete(steamId);
      db.removeAccount(steamId);
      emit();
    },
  };
}

export type AccountManager = ReturnType<typeof createAccountManager>;
