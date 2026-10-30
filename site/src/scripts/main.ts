import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { fetchStars, formatStars } from "../lib/github-stars/github-stars";
import { initDownload } from "../lib/download/download.client";
import { githubStarsConfig } from "../lib/github-stars/github-stars.config";

gsap.registerPlugin(ScrollTrigger);

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Star count: the build-time number is refreshed once per session so a static deploy never goes stale. */
(async () => {
  const slots = document.querySelectorAll<HTMLElement>(`[${githubStarsConfig.attr}]`);
  if (!slots.length) return;
  const cached = sessionStorage.getItem(githubStarsConfig.storageKey);
  const stars = cached !== null ? Number(cached) : await fetchStars();
  if (stars === null || Number.isNaN(stars)) return;
  sessionStorage.setItem(githubStarsConfig.storageKey, String(stars));
  slots.forEach((el) => {
    const n = el.querySelector<HTMLElement>("[data-stars-n]");
    if (n) n.textContent = formatStars(stars);
    el.hidden = false;
  });
})();

/* Header: a fixed pill whenever the page is past half a screen, fading in and out at that line (works with or without motion). */
const floatHeader = document.querySelector<HTMLElement>(".hdr");
if (floatHeader) {
  const sentinel = document.createElement("div");
  sentinel.setAttribute("aria-hidden", "true");
  sentinel.style.cssText =
    "position:absolute;top:50vh;left:0;width:1px;height:1px;pointer-events:none";
  document.body.prepend(sentinel);
  const FADE_MS = reduced ? 0 : 350;
  let fadeTimer: number | undefined;
  new IntersectionObserver(([entry]) => {
    window.clearTimeout(fadeTimer);
    if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
      floatHeader.classList.remove("is-fading");
      floatHeader.classList.add("is-float");
    } else if (floatHeader.classList.contains("is-float")) {
      // Back above the half-screen mark: fade the pill out, then hand the header back to the page flow.
      floatHeader.classList.add("is-fading");
      fadeTimer = window.setTimeout(
        () => floatHeader.classList.remove("is-float", "is-fading"),
        FADE_MS,
      );
    }
  }).observe(sentinel);
}

/* Mobile menu */
const menuBtn = document.querySelector<HTMLButtonElement>("[data-menu]");
const menuNav = document.getElementById("primary-nav");
if (menuBtn && menuNav) {
  const label = menuBtn.querySelector<HTMLElement>("[data-menu-label]");
  const set = (open: boolean) => {
    menuBtn.setAttribute("aria-expanded", String(open));
    menuNav.classList.toggle("is-open", open);
    if (label) label.textContent = open ? "Close" : "Menu";
  };
  menuBtn.addEventListener("click", () => set(menuBtn.getAttribute("aria-expanded") !== "true"));
  menuNav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => set(false)));
  addEventListener("keydown", (e) => {
    if (e.key === "Escape") set(false);
  });
}

const seen = document.documentElement.classList.contains("seen");
sessionStorage.setItem("oi-seen", "1");

if (!reduced) {
  // One clock: Lenis rides the GSAP ticker, ScrollTrigger reads Lenis.
  const lenis = new Lenis({ lerp: 0.1, anchors: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  // Reveals
  document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      once: true,
      onEnter: () => el.classList.add("is-in"),
    });
  });

  // Late layout shifts (the hero island collapses five stacked demos into one once it
  // hydrates) move every section below it after ScrollTrigger has cached its positions.
  // Refresh once the shift settles so deeper triggers re-measure instead of firing late.
  const recalc = () => ScrollTrigger.refresh();
  window.addEventListener("load", recalc);
  if ("ResizeObserver" in window) {
    const stage = document.querySelector(".hero__stage");
    if (stage) new ResizeObserver(recalc).observe(stage);
  }

  // Count-up for the readout. The server-rendered value stays in the DOM for crawlers.
  // The roll waits until the stat is actually in view — spending it on load means the
  // "it's alive" moment happens off-screen for anyone who lands and scrolls.
  const count = document.querySelector<HTMLElement>("[data-count]");
  const text = count?.querySelector<HTMLElement>("[data-count-text]");
  if (count && text) {
    const target = Number(count.dataset.count);
    const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
    if (seen) text.textContent = fmt.format(target);
    else {
      text.textContent = fmt.format(0);
      ScrollTrigger.create({
        trigger: count,
        start: "top 92%",
        once: true,
        onEnter: () => {
          const o = { v: 0 };
          gsap.to(o, {
            v: target,
            duration: 1.2,
            ease: "expo.out",
            onUpdate: () => {
              text.textContent = fmt.format(o.v);
            },
          });
        },
      });
    }
  }
}

void initDownload();
