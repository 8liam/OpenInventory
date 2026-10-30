import { RELEASE_API, PLATFORMS } from "./download.config";
import { detectPlatform } from "./download.detect";
import { parseRelease } from "./download.releases";
import type { PlatformLink } from "./download.types";

const SEL = {
  button: "[data-dl]",
  icon: "[data-dl-icon]",
} as const;

const readLinks = (button: HTMLElement): PlatformLink[] => {
  try {
    return JSON.parse(button.dataset.dlLinks ?? "[]") as PlatformLink[];
  } catch {
    return [];
  }
};

/** Looks up the newest release, so the page never serves a stale version after a publish. */
async function latestLinks(): Promise<PlatformLink[] | null> {
  try {
    const res = await fetch(RELEASE_API, { headers: { Accept: "application/vnd.github+json" } });
    return res.ok ? parseRelease(await res.json()).links : null;
  } catch {
    return null;
  }
}

export async function initDownload(): Promise<void> {
  const button = document.querySelector<HTMLAnchorElement>(SEL.button);
  if (!button) return;
  const [id, fresh] = await Promise.all([detectPlatform(), latestLinks()]);
  const spec = PLATFORMS.find((p) => p.id === id);
  const href = (fresh ?? readLinks(button)).find((l) => l.id === id)?.href;
  if (!spec || !href) return;
  button.href = href;
  button.dataset.dlPlatform = spec.id;
  button.setAttribute("aria-label", `Download OpenInventory for ${spec.label}`);
  button
    .querySelectorAll<HTMLElement>(SEL.icon)
    .forEach((el) => el.toggleAttribute("hidden", el.dataset.dlIcon !== spec.icon));
}
