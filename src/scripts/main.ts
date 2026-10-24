import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

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

/* Mobile menu */
const menuBtn = document.querySelector<HTMLButtonElement>('[data-menu]');
const menuNav = document.getElementById('primary-nav');
if (menuBtn && menuNav) {
  const label = menuBtn.querySelector<HTMLElement>('[data-menu-label]');
  const set = (open: boolean) => {
    menuBtn.setAttribute('aria-expanded', String(open));
    menuNav.classList.toggle('is-open', open);
    if (label) label.textContent = open ? 'Close' : 'Menu';
  };
  menuBtn.addEventListener('click', () => set(menuBtn.getAttribute('aria-expanded') !== 'true'));
  menuNav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => set(false)));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
}

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
    gsap.to(o, { v: target, duration: 1.2, delay: 0.2, ease: 'expo.out', onUpdate: () => { text.textContent = fmt.format(o.v); } });
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

/* Chapter figures roll up when their row first scrolls into view. */
document.querySelectorAll<HTMLElement>('[data-fig]').forEach((el) => {
  const target = Number(el.dataset.value);
  const decimals = Number(el.dataset.decimals);
  const prefix = el.dataset.prefix ?? '';
  const suffix = el.dataset.suffix ?? '';
  const label = el.querySelector<HTMLElement>('.mono');
  const node = [...el.childNodes].find((n) => n.nodeType === Node.TEXT_NODE);
  if (!node || reduced) return;
  const fmt = (v: number) =>
    `${v < 0 ? '-' : ''}${prefix}${Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`;
  const o = { v: 0 };
  ScrollTrigger.create({
    trigger: el,
    start: 'top 85%',
    once: true,
    onEnter: () => gsap.to(o, { v: target, duration: 1.4, ease: 'expo.out', onUpdate: () => { node.textContent = fmt(o.v); } }),
  });
  node.textContent = fmt(0);
  void label;
});
