import * as z from "zod/mini";
import {
  SKIN_VIEWER_EMBED_PATH,
  SKIN_VIEWER_ESCAPE_KEY,
  SKIN_VIEWER_FLOAT_RANGE,
  SKIN_VIEWER_MESSAGES,
  SKIN_VIEWER_ORIGIN,
  SKIN_VIEWER_PARAMS,
  SKIN_VIEWER_SEED_RANGE,
} from "./skin-viewer.config.ts";
import type { SkinViewerItem, SkinViewerMessage } from "./skin-viewer.types.ts";

/** Skins are named by def index + paint index; a vanilla item (paint 0) has no skin to show. */
export function canPreviewSkin(item: SkinViewerItem): boolean {
  return (
    item.defIndex !== null &&
    item.defIndex !== undefined &&
    item.paintIndex !== null &&
    item.paintIndex !== undefined &&
    item.paintIndex > 0
  );
}

/** The embed iframe URL for an item, or null when it has no def and paint index. */
export function buildSkinViewerUrl(item: SkinViewerItem): string | null {
  if (!canPreviewSkin(item) || item.defIndex == null || item.paintIndex == null) return null;
  const url = new URL(SKIN_VIEWER_EMBED_PATH, SKIN_VIEWER_ORIGIN);
  url.searchParams.set(SKIN_VIEWER_PARAMS.defIndex, String(item.defIndex));
  url.searchParams.set(SKIN_VIEWER_PARAMS.paintIndex, String(Math.round(item.paintIndex)));
  const { wear, paintSeed } = item;
  if (
    wear !== null &&
    wear !== undefined &&
    wear >= SKIN_VIEWER_FLOAT_RANGE.min &&
    wear <= SKIN_VIEWER_FLOAT_RANGE.max
  ) {
    url.searchParams.set(SKIN_VIEWER_PARAMS.float, String(wear));
  }
  if (
    paintSeed !== null &&
    paintSeed !== undefined &&
    paintSeed >= SKIN_VIEWER_SEED_RANGE.min &&
    paintSeed <= SKIN_VIEWER_SEED_RANGE.max
  ) {
    url.searchParams.set(SKIN_VIEWER_PARAMS.seed, String(Math.round(paintSeed)));
  }
  return url.toString();
}

const messageSchema = z.object({ type: z.string(), key: z.optional(z.string()) });

/**
 * Reads a `message` event from the embed. Returns null for anything that did not come from the
 * embed's origin and the given iframe window, or that the app does not act on.
 */
export function parseSkinViewerMessage(
  event: { readonly origin: string; readonly source: unknown; readonly data: unknown },
  frameWindow: unknown,
): SkinViewerMessage | null {
  if (event.origin !== SKIN_VIEWER_ORIGIN || event.source !== frameWindow) return null;
  const parsed = messageSchema.safeParse(event.data);
  if (!parsed.success) return null;
  const { type, key } = parsed.data;
  switch (type) {
    case SKIN_VIEWER_MESSAGES.ready:
      return { kind: "ready" };
    case SKIN_VIEWER_MESSAGES.loading:
      return { kind: "loading" };
    case SKIN_VIEWER_MESSAGES.loaded:
      return { kind: "loaded" };
    case SKIN_VIEWER_MESSAGES.error:
      return { kind: "error" };
    case SKIN_VIEWER_MESSAGES.key:
      return key === SKIN_VIEWER_ESCAPE_KEY ? { kind: "escape" } : null;
    default:
      return null;
  }
}
