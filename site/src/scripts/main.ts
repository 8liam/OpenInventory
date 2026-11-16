import { fetchStars, formatStars } from "../lib/github-stars/github-stars";
import { initDownload } from "../lib/download/download.client";
import { githubStarsConfig } from "../lib/github-stars/github-stars.config";
import { MAIN_SELECTORS, MAIN_MEDIA } from "./main.config";

/* Star count: the build-time number is refreshed once per session so a static deploy never goes stale. */
(async () => {
  const slots = document.querySelectorAll<HTMLElement>(`[${githubStarsConfig.attr}]`);
  if (!slots.length) return;
  let cached: string | null = null;
  try {
    cached = sessionStorage.getItem(githubStarsConfig.storageKey);
  } catch {
    /* Storage is optional. */
  }
  const stars = cached !== null ? Number(cached) : await fetchStars();
  if (stars === null || Number.isNaN(stars)) return;
  try {
    sessionStorage.setItem(githubStarsConfig.storageKey, String(stars));
  } catch {
    /* Storage is optional. */
  }
  slots.forEach((el) => {
    const n = el.querySelector<HTMLElement>(MAIN_SELECTORS.starsNumber);
    if (n) n.textContent = formatStars(stars);
    el.hidden = false;
  });
})().catch(() => {
  /* Keep the server-rendered count if the request fails. */
});

// Two animation frames allow server-rendered content to paint before optional motion loads.
// Fetch the libraries together rather than creating a motion -> Lenis request chain.
const preference = matchMedia(MAIN_MEDIA.reducedMotion);
const scheduleMotion = () => {
  if (preference.matches) return;
  preference.removeEventListener("change", scheduleMotion);
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      const start = () => {
        void Promise.all([
          import("./motion"),
          matchMedia(MAIN_MEDIA.finePointer).matches
            ? import("lenis").then((module) => module.default).catch(() => null)
            : Promise.resolve(null),
        ])
          .then(([{ initMotion }, Lenis]) => initMotion(Lenis))
          .catch(() => {
            /* Leave server-rendered content visible when optional motion is unavailable. */
          });
      };
      if ("requestIdleCallback" in window) window.requestIdleCallback(start);
      else start();
    }),
  );
};
preference.addEventListener("change", scheduleMotion);
scheduleMotion();

void initDownload();
