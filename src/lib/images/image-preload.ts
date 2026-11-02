import { IMAGE_PRELOAD } from "./image-preload.config";

/** URLs already decoded this session; thumbs mounting later can skip their fade-in. */
const loaded = new Set<string>();
const requested = new Set<string>();

export function isImageLoaded(url: string): boolean {
  return loaded.has(url);
}

export function markImageLoaded(url: string): void {
  loaded.add(url);
}

function load(url: string): void {
  const image = new Image();
  image.decoding = "async";
  image.onload = () => markImageLoaded(url);
  image.src = url;
}

function whenIdle(run: () => void): void {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(run, { timeout: IMAGE_PRELOAD.idleTimeoutMs });
  } else {
    setTimeout(run, 0);
  }
}

/** Warms the browser cache for `urls` in small idle batches; each URL is requested once. */
export function preloadImages(urls: readonly (string | null)[]): void {
  const pending = [...new Set(urls)].filter(
    (url): url is string => url !== null && !requested.has(url),
  );
  const next = (): void => {
    for (const url of pending.splice(0, IMAGE_PRELOAD.batchSize)) {
      requested.add(url);
      load(url);
    }
    if (pending.length > 0) whenIdle(next);
  };
  if (pending.length > 0) whenIdle(next);
}
