import { PLATFORMS, RELEASES_PAGE, RELEASE_API } from "./download.config";
import type { PlatformLink, ReleaseAsset, ReleaseInfo } from "./download.types";

type ReleasePayload = { tag_name?: unknown; assets?: unknown };

const isAsset = (v: unknown): v is ReleaseAsset =>
  typeof v === "object" &&
  v !== null &&
  typeof (v as ReleaseAsset).name === "string" &&
  typeof (v as ReleaseAsset).browser_download_url === "string";

/** Maps a GitHub release payload to one link per platform; platforms without an asset point at the releases page. */
export function parseRelease(payload: ReleasePayload): ReleaseInfo {
  const assets = Array.isArray(payload.assets) ? payload.assets.filter(isAsset) : [];
  const links: PlatformLink[] = PLATFORMS.map((p) => ({
    id: p.id,
    label: p.label,
    short: p.short,
    icon: p.icon,
    href: assets.find((a) => p.asset.test(a.name))?.browser_download_url ?? RELEASES_PAGE,
  }));
  return { tag: typeof payload.tag_name === "string" ? payload.tag_name : "", links };
}

/** Build-time fetch. Never throws: a failed lookup degrades to links at the releases page. */
export async function fetchRelease(): Promise<ReleaseInfo> {
  try {
    const res = await fetch(RELEASE_API, { headers: { Accept: "application/vnd.github+json" } });
    if (!res.ok) throw new Error(`GitHub responded ${res.status}`);
    return parseRelease((await res.json()) as ReleasePayload);
  } catch (err) {
    console.warn(`[download] release lookup failed, linking to ${RELEASES_PAGE}:`, err);
    return parseRelease({});
  }
}
