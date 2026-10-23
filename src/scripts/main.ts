import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { story } from '../data/site.config';

gsap.registerPlugin(ScrollTrigger);

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

/* Copy buttons work without motion */
document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((btn) => {
  const label = btn.querySelector<HTMLElement>('[data-copy-label]');
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy ?? '');
      if (label) label.textContent = btn.dataset.done ?? '';
      setTimeout(() => { if (label) label.textContent = btn.dataset.idle ?? ''; }, 1800);
    } catch {
      /* clipboard blocked: the command stays selectable in the block above */
    }
  });
});

const seen = document.documentElement.classList.contains('seen');
sessionStorage.setItem('oi-seen', '1');

if (!reduced) {
  // One clock: Lenis rides the GSAP ticker, ScrollTrigger reads Lenis.
  const lenis = new Lenis({ lerp: 0.1, anchors: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  // Reveals
  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => el.classList.add('is-in') });
  });

  // Count-up for the readout. The server-rendered value stays in the DOM for crawlers.
  const count = document.querySelector<HTMLElement>('[data-count]');
  const text = count?.querySelector<HTMLElement>('[data-count-text]');
  if (count && text) {
    const target = Number(count.dataset.count);
    const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
    const o = { v: 0 };
    if (seen) text.textContent = fmt.format(target);
    else {
    text.textContent = fmt.format(0);
    gsap.to(o, { v: target, duration: 1.8, delay: 0.3, ease: 'expo.out', onUpdate: () => { text.textContent = fmt.format(o.v); } });
    }
  }

  // Hero screenshot settles flat as you scroll.
  const stage = document.querySelector<HTMLElement>('[data-stage] .shot');
  if (stage) {
    gsap.fromTo(stage, { rotateX: 16, scale: 0.9, y: 40, transformPerspective: 1800, transformOrigin: '50% 0%' }, {
      rotateX: 0, scale: 1, y: 0, ease: 'none',
      scrollTrigger: { trigger: '[data-stage]', start: 'top 95%', end: 'top 25%', scrub: 0.6 },
    });
  }

  // Header hides on scroll down, returns on scroll up
  const hdr = document.querySelector<HTMLElement>('.hdr');
  if (hdr) {
    const show = gsap.quickTo(hdr, 'yPercent', { duration: 0.5, ease: 'power3.out' });
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (s) => show(s.direction === 1 && s.scroll() > 200 ? -100 : 0) });
  }

  // Magnetic primary buttons on fine pointers
  if (fine) {
    document.querySelectorAll<HTMLElement>('.btn--solid').forEach((el) => {
      const x = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
      const y = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        x((e.clientX - (r.left + r.width / 2)) * 0.25);
        y((e.clientY - (r.top + r.height / 2)) * 0.35);
      });
      el.addEventListener('pointerleave', () => { x(0); y(0); });
    });
  }
}

/* Story stage: the active chapter picks the screenshot and re-reads the ledger figure. */
const layers = [...document.querySelectorAll<HTMLElement>('[data-layer]')];
const fig = document.querySelector<HTMLElement>('[data-fig]');
const figLabel = document.querySelector<HTMLElement>('[data-fig-label]');
const route = document.querySelector<HTMLElement>('[data-stage-route]');
const setTone = (v: number) => fig?.classList.toggle('is-neg', v < 0);
const fmtFig = (f: (typeof story.chapters)[number]['figure'], v: number) =>
  `${v < 0 ? '-' : ''}${f.prefix}${Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: f.decimals, maximumFractionDigits: f.decimals })}${f.suffix}`;
const shown = { v: story.chapters[0].figure.value };
if (layers.length) {
  const activate = (i: number) => {
    layers.forEach((l, n) => (n === i ? l.setAttribute('data-on', '') : l.removeAttribute('data-on')));
    const c = story.chapters[i];
    if (!c) return;
    if (route) route.textContent = c.route;
    setTone(c.figure.value);
    if (figLabel) figLabel.textContent = c.figure.label;
    if (!fig) return;
    if (reduced) { fig.textContent = fmtFig(c.figure, c.figure.value); return; }
    gsap.to(shown, { v: c.figure.value, duration: 1.1, ease: 'expo.out', overwrite: true, onUpdate: () => { fig.textContent = fmtFig(c.figure, shown.v); } });
  };
  document.querySelectorAll<HTMLElement>('[data-chapter]').forEach((ch) => {
    ScrollTrigger.create({
      trigger: ch,
      start: 'top 55%',
      end: 'bottom 55%',
      onToggle: (st) => { if (st.isActive) activate(Number(ch.dataset.chapter)); },
    });
  });
}
