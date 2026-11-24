import { act } from "@testing-library/react";
import { AUTH_STATUS } from "~/lib/storage/storage.config";
import type { AccountState, AppSnapshot, StorageSnapshot } from "~/lib/storage/storage.types";

const CONNECTING = 0;
const OPEN = 1;
const CLOSED = 2;
const OK_STATUS = 200;
const JSON_HEADERS = { "content-type": "application/json" } as const;

/** A stand-in for the server's event stream that tests push snapshots through. */
export class FakeEventSource {
  static readonly CONNECTING = CONNECTING;
  static readonly OPEN = OPEN;
  static readonly CLOSED = CLOSED;
  static instances: FakeEventSource[] = [];
  readyState = CONNECTING;
  onmessage: ((event: MessageEvent<string>) => void) | null = null;
  onerror: (() => void) | null = null;
  readonly url: string;
  constructor(url: string) {
    this.url = url;
    FakeEventSource.instances.push(this);
  }
  close(): void {
    this.readyState = CLOSED;
  }
  emit(data: string): void {
    this.readyState = OPEN;
    this.onmessage?.({ data } as MessageEvent<string>);
  }
  fail(): void {
    this.onerror?.();
  }
}

export type FetchCall = {
  readonly path: string;
  readonly method: string;
  readonly body: unknown;
};

export type Responder = (call: FetchCall) => { status?: number; body?: unknown };

export type FakeApi = {
  readonly calls: FetchCall[];
  /** Registers the reply for requests whose path starts with `prefix`. */
  respond: (prefix: string, responder: Responder) => void;
  /** Delivers a snapshot to every open event stream. */
  push: (snapshot: AppSnapshot) => Promise<void>;
  restore: () => void;
};

function parseBody(raw: unknown): unknown {
  if (typeof raw !== "string") return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

/** Swaps global `fetch` and `EventSource` for scripted ones. Call `restore()` when done. */
export function installFakeApi(): FakeApi {
  const calls: FetchCall[] = [];
  const responders: { prefix: string; responder: Responder }[] = [];
  const realFetch = globalThis.fetch;
  const realEventSource = (globalThis as { EventSource?: unknown }).EventSource;
  FakeEventSource.instances = [];
  (globalThis as { EventSource?: unknown }).EventSource = FakeEventSource;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const path = String(input);
    const call: FetchCall = {
      path,
      method: init?.method ?? "GET",
      body: parseBody(init?.body),
    };
    calls.push(call);
    const match = [...responders].reverse().find(({ prefix }) => path.startsWith(prefix));
    const reply = match?.responder(call) ?? {};
    const status = reply.status ?? OK_STATUS;
    return new Response(JSON.stringify(reply.body ?? {}), { status, headers: JSON_HEADERS });
  }) as typeof fetch;
  return {
    calls,
    respond: (prefix, responder) => {
      responders.push({ prefix, responder });
    },
    push: async (snapshot) => {
      await act(async () => {
        for (const source of FakeEventSource.instances) {
          if (source.readyState !== CLOSED) source.emit(JSON.stringify(snapshot));
        }
      });
    },
    restore: () => {
      globalThis.fetch = realFetch;
      (globalThis as { EventSource?: unknown }).EventSource = realEventSource;
      FakeEventSource.instances = [];
    },
  };
}

export const STEAM_ID_A = "76561198000000001";
export const STEAM_ID_B = "76561198000000002";

export function storageSnapshot(overrides: Partial<StorageSnapshot> = {}): StorageSnapshot {
  return {
    auth: { status: AUTH_STATUS.ready, displayName: "Alpha" },
    units: [],
    loadingUnits: false,
    transfer: { status: "idle" },
    syncError: null,
    revision: 1,
    ...overrides,
  };
}

export function accountState(steamId: string, overrides: Partial<AccountState> = {}): AccountState {
  return {
    steamId,
    label: null,
    addedAt: 0,
    displayName: "Alpha",
    snapshot: storageSnapshot(),
    ...overrides,
  };
}

export function appSnapshot(accounts: readonly AccountState[]): AppSnapshot {
  return { accounts, login: { status: AUTH_STATUS.signedOut }, lastLogin: null, revision: 1 };
}
