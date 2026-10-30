import type { TransferRequest } from '~/lib/storage/storage.types';

type Handler = (request: TransferRequest) => Promise<void>;

let handler: Handler | undefined;

/** The demo registers how a "move" is simulated; nothing here ever leaves the browser. */
export function setTransferHandler(next: Handler | undefined): void {
  handler = next;
}

export async function postJson(_path: string, body: unknown): Promise<void> {
  await handler?.(body as TransferRequest);
}
