import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { fetchStars, formatStars } from "../lib/github-stars/github-stars";
import { initDownload } from "../lib/download/download.client";
import { githubStarsConfig } from "../lib/github-stars/github-stars.config";
import {
  COUNT_UP, LENIS_OPTIONS, MAIN_CLASSES, MAIN_MEDIA, MAIN_SELECTORS, MAIN_STORAGE, MS_PER_SECOND, PARALLAX, REVEAL_START,
} from "./main.config";

gsap.registerPlugin(ScrollTrigger);

/* Star count: the build-time number is refreshed once per session so a static deploy never goes stale. */
(async () => {
  const slots = document.querySelectorAll<HTMLElement>(`[${githubStarsConfig.attr}]`);
  if (!slots.length) return;
  let cached: string | null = null;
  try { cached = sessionStorage.getItem(githubStarsConfig.storageKey); } catch { /* Storage is optional. */ }
  const stars = cached !== null ? Number(cached) : await fetchStars();
  if (stars === null || Number.isNaN(stars)) return;
  try { sessionStorage.setItem(githubStarsConfig.storageKey, String(stars)); } catch { /* Storage is optional. */ }
  slots.forEach((el) => {
    const n = el.querySelector<HTMLElement>(MAIN_SELECTORS.starsNumber);
    if (n) n.textContent = formatStars(stars);
    el.hidden = false;
  });
})().catch(() => { /* Keep the server-rendered count if the request fails. */ });

let seen = false;
try {
  seen = sessionStorage.getItem(MAIN_STORAGE.seen) !== null;
  sessionStorage.setItem(MAIN_STORAGE.seen, MAIN_STORAGE.seenValue);
} catch { /* Motion and downloads must also work with storage blocked. */ }

const currencyFormat = () => new Intl.NumberFormat(COUNT_UP.locale, { style: "currency", currency: COUNT_UP.currency });

// matchMedia reverts GSAP effects and runs cleanup when the preference changes.
const motion = gsap.matchMedia();
motion.add(MAIN_MEDIA.noReducedMotion, () => {
  document.documentElement.classList.add(MAIN_CLASSES.motion);
  // One clock: Lenis rides the GSAP ticker, ScrollTrigger reads Lenis.
  const lenis = new Lenis({ ...LENIS_OPTIONS });
  lenis.on("scroll", ScrollTrigger.update);
  const tick = (seconds: number) => lenis.raf(seconds * MS_PER_SECOND);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  // First-screen content paints immediately; only offscreen content reveals up.
  const reveals = document.querySelectorAll<HTMLElement>(MAIN_SELECTORS.reveal);
  reveals.forEach((el) => {
    if (el.classList.contains(MAIN_CLASSES.revealed)) return;
    if (el.getBoundingClientRect().top < window.innerHeight) {
      el.classList.add(MAIN_CLASSES.revealed);
      return;
    }
    const reveal = () => {
      el.classList.remove(MAIN_CLASSES.pending);
      el.classList.add(MAIN_CLASSES.revealed);
    };
    ScrollTrigger.create({ trigger: el, start: REVEAL_START, once: true, onEnter: reveal });
    if (!el.classList.contains(MAIN_CLASSES.revealed)) el.classList.add(MAIN_CLASSES.pending);
  });

  // An empty data-parallax opts into gentle motion; a number is travel in pixels.
  // Clamp travel so accidental values cannot pull artwork far out of its panel.
  document.querySelectorAll<HTMLElement>(MAIN_SELECTORS.parallax).forEach((el) => {
    const requested = Number(el.dataset.parallax);
    const distance = el.dataset.parallax?.trim() && Number.isFinite(requested)
      ? gsap.utils.clamp(-PARALLAX.maxDistance, PARALLAX.maxDistance, requested) : PARALLAX.defaultDistance;
    gsap.fromTo(el, { y: -distance }, {
      y: distance,
      ease: "none",
      scrollTrigger: { trigger: el.parentElement ?? el, start: PARALLAX.start, end: PARALLAX.end, scrub: PARALLAX.scrub },
    });
  });

  // Island hydration and font loading can change trigger positions.
  let refreshFrame = 0;
  const recalc = () => {
    cancelAnimationFrame(refreshFrame);
    refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
  };
  window.addEventListener("load", recalc);
  const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(recalc);
  const main = document.querySelector("main");
  if (main) observer?.observe(main);

  // Count-up for the readout. The server-rendered value stays in the DOM for crawlers.
  // The roll waits until the stat is actually in view — spending it on load means the
  // "it's alive" moment happens off-screen for anyone who lands and scrolls.
  const count = document.querySelector<HTMLElement>(MAIN_SELECTORS.count);
  const text = count?.querySelector<HTMLElement>(MAIN_SELECTORS.countText);
  if (count && text) {
    const target = Number(count.dataset.count);
    const fmt = currencyFormat();
    if (seen) text.textContent = fmt.format(target);
    else {
      text.textContent = fmt.format(0);
      ScrollTrigger.create({
        trigger: count,
        start: COUNT_UP.start,
        once: true,
        onEnter: () => {
          const o = { v: 0 };
          gsap.to(o, {
            v: target,
            duration: COUNT_UP.durationSeconds,
            ease: COUNT_UP.ease,
            onUpdate: () => {
              text.textContent = fmt.format(o.v);
            },
          });
        },
      });
    }
  }

  return () => {
    gsap.ticker.remove(tick);
    lenis.destroy();
    observer?.disconnect();
    cancelAnimationFrame(refreshFrame);
    window.removeEventListener("load", recalc);
    document.documentElement.classList.remove(MAIN_CLASSES.motion);
    reveals.forEach((el) => el.classList.remove(MAIN_CLASSES.pending));
    // A preference change mid-count must restore the full, meaningful value.
    if (count && text) {
      text.textContent = currencyFormat().format(Number(count.dataset.count));
    }
  };
});

void initDownload();
