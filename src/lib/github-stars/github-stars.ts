import { githubStarsConfig } from './github-stars.config';
import { repoResponseSchema } from './github-stars.types';

/** Star count from the GitHub API, or null if it cannot be read (the UI then hides the count). */
export async function fetchStars(): Promise<number | null> {
  try {
    const res = await fetch(githubStarsConfig.api, {
      headers: { Accept: 'application/vnd.github+json' },
      signal: AbortSignal.timeout(githubStarsConfig.timeoutMs),
    });
    if (!res.ok) return null;
    return repoResponseSchema.parse(await res.json()).stargazers_count;
  } catch {
    return null;
  }
}

export function formatStars(n: number): string {
  return new Intl.NumberFormat(githubStarsConfig.locale, { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}
