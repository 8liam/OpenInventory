import { githubStarsConfig } from './github-stars.config';
import { repoResponseSchema } from './github-stars.types';

let cache: { stars: number; at: number } | null = null;
let retryAfter = 0;

/**
 * Star count from the GitHub API, cached in memory so a dev server or a build does not burn the 60/hour anonymous limit.
 * A failed fetch keeps serving the last good value; null only if there has never been one (the UI then hides the count).
 */
export async function fetchStars(): Promise<number | null> {
  if (cache && Date.now() - cache.at < githubStarsConfig.cacheTtlMs) return cache.stars;
  if (Date.now() < retryAfter) return cache?.stars ?? null;
  try {
    const token = typeof process === 'undefined' ? undefined : process.env[githubStarsConfig.tokenEnv];
    const res = await fetch(githubStarsConfig.api, {
      headers: { Accept: 'application/vnd.github+json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      signal: AbortSignal.timeout(githubStarsConfig.timeoutMs),
    });
    if (!res.ok) {
      retryAfter = Date.now() + githubStarsConfig.retryBackoffMs;
      return cache?.stars ?? null;
    }
    cache = { stars: repoResponseSchema.parse(await res.json()).stargazers_count, at: Date.now() };
    return cache.stars;
  } catch {
    retryAfter = Date.now() + githubStarsConfig.retryBackoffMs;
    return cache?.stars ?? null;
  }
}

export function formatStars(n: number): string {
  return new Intl.NumberFormat(githubStarsConfig.locale, { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}
