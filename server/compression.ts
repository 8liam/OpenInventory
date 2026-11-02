import { gzip } from "node:zlib";
import { promisify } from "node:util";
import { COMPRESSION } from "./compression.config.ts";

const gzipAsync = promisify(gzip);

export type EncodedBody = {
  readonly body: Buffer;
  /** Value for the Content-Encoding header, when the body was compressed. */
  readonly encoding: string | undefined;
};

export function acceptsGzip(acceptEncoding: string | undefined): boolean {
  return acceptEncoding !== undefined && COMPRESSION.acceptPattern.test(acceptEncoding);
}

/** Gzips `body` when the client accepts it and it is a large, compressible payload. */
export async function encodeBody(
  body: Buffer,
  contentType: string,
  acceptEncoding: string | undefined,
): Promise<EncodedBody> {
  const plain: EncodedBody = { body, encoding: undefined };
  if (body.length <= COMPRESSION.minBytes) return plain;
  if (!COMPRESSION.compressibleTypes.test(contentType) || !acceptsGzip(acceptEncoding))
    return plain;
  try {
    return { body: await gzipAsync(body), encoding: COMPRESSION.encoding };
  } catch (error) {
    console.warn("[compression]", error);
    return plain;
  }
}
