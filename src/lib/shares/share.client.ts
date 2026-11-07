import { COPY } from "../copy/copy.config.ts";
import type { ApiError } from "../storage/storage.types.ts";
import { SHARE_API } from "./share.config.ts";
import type {
  CreateShareRequest,
  ShareCreatedResponse,
  ShareListResponse,
  SharedInventory,
} from "./share.types.ts";

const HTTP_NOT_FOUND = 404;
const HTTP_RATE_LIMITED = 429;
const HTTP_UNAVAILABLE = 503;
const JSON_HEADERS = { "content-type": "application/json" } as const;

/** A failed share request, carrying the HTTP status so callers can word it. */
export class ShareRequestError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function readError(response: Response): Promise<ShareRequestError> {
  const body = (await response.json().catch(() => undefined)) as ApiError | undefined;
  return new ShareRequestError(body?.error ?? COPY.shares.requestFailed, response.status);
}

async function requestJson<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(path, init);
  if (!response.ok) throw await readError(response);
  return (await response.json()) as T;
}

export function listShareLinks(): Promise<ShareListResponse> {
  return requestJson<ShareListResponse>(SHARE_API.shares, { method: "GET" });
}

export function createShareLink(request: CreateShareRequest): Promise<ShareCreatedResponse> {
  return requestJson<ShareCreatedResponse>(SHARE_API.shares, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(request),
  });
}

export async function revokeShareLink(id: string): Promise<void> {
  const response = await fetch(SHARE_API.revoke, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ id }),
  });
  if (!response.ok) throw await readError(response);
}

/** The public share. Carries no session: the recipient never signs in. */
export function fetchSharedInventory(token: string, signal: AbortSignal): Promise<SharedInventory> {
  return requestJson<SharedInventory>(`${SHARE_API.publicPrefix}${token}`, { signal });
}

/** The line to show a recipient for a failed share load. */
export function sharedFailureMessage(error: unknown): string {
  if (!(error instanceof ShareRequestError)) return COPY.shares.requestFailed;
  switch (error.status) {
    case HTTP_NOT_FOUND:
      return COPY.shares.invalidLink;
    case HTTP_RATE_LIMITED:
      return COPY.shares.rateLimited;
    case HTTP_UNAVAILABLE:
      return COPY.shares.unavailable;
    default:
      return error.message;
  }
}
