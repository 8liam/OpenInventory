import manifest from './item-images.json';

/** Fixed "now" for every sample timestamp so server and client render identical markup. */
export const MOCK_NOW = Date.UTC(2026, 9, 19, 18, 38, 28);
export const MOCK_CURRENCY = 'USD';
export const HOUR_MS = 3_600_000;
export const DAY_MS = 86_400_000;

type ManifestEntry = { readonly file: string; readonly color: string | null; readonly rarity: string | null };
const images = manifest as Record<string, ManifestEntry>;

export function itemImage(name: string): string | null {
  return images[name]?.file ?? null;
}

export function itemColor(name: string): string | null {
  return images[name]?.color ?? null;
}

/** Deterministic pseudo-random walk, so history looks organic but never changes between builds. */
export function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}
