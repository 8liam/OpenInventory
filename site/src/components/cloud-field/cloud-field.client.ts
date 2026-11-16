import { GLOW_FIELD as CONFIG } from "./cloud-field.config";

/**
 * Optional enhancement: feeds the pointer position (-1..1, eased) and scroll progress (0..1) into CSS
 * variables on the field, so each skin can parallax at its own depth using transform only.
 * Without JS or with reduced motion nothing runs; coarse pointers get scroll parallax only.
 */
function mount(root: HTMLElement, usePointer: boolean): void {
  const host = root.parentElement;
  if (!host) return;
  let targetX = 0;
  let targetY = 0;
  let x = 0;
  let y = 0;
  let scrollProgress = -1;
  let frame = 0;
  let visible = false;

  const paint = () => {
    frame = 0;
    x += (targetX - x) * CONFIG.easing;
    y += (targetY - y) * CONFIG.easing;
    root.style.setProperty(CONFIG.mouseXVar, x.toFixed(4));
    root.style.setProperty(CONFIG.mouseYVar, y.toFixed(4));
    if (
      Math.abs(targetX - x) > CONFIG.settleEpsilon ||
      Math.abs(targetY - y) > CONFIG.settleEpsilon
    )
      schedule();
  };
  const schedule = () => {
    if (!frame && visible) frame = requestAnimationFrame(paint);
  };
  const onScroll = () => {
    const rect = host.getBoundingClientRect();
    if (!rect.height) return;
    const next = Math.max(0, Math.min(1, -rect.top / rect.height));
    if (Math.abs(next - scrollProgress) < CONFIG.settleEpsilon) return;
    scrollProgress = next;
    root.style.setProperty(CONFIG.scrollVar, next.toFixed(4));
  };
  const onMove = (event: PointerEvent) => {
    const rect = host.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    targetX = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - 0.5) * 2));
    targetY = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - 0.5) * 2));
    schedule();
  };
  const onLeave = () => {
    targetX = 0;
    targetY = 0;
    schedule();
  };

  if (usePointer) {
    host.addEventListener("pointermove", onMove, { passive: true });
    host.addEventListener("pointerleave", onLeave, { passive: true });
  }
  new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? false;
    if (visible) {
      onScroll();
      schedule();
      window.addEventListener("scroll", onScroll, { passive: true });
    } else {
      window.removeEventListener("scroll", onScroll);
    }
  }).observe(root);
}

const motion = window.matchMedia(CONFIG.reducedMotionQuery);
const pointer = window.matchMedia(CONFIG.finePointerQuery);
if (!motion.matches) {
  document.querySelectorAll<HTMLElement>(CONFIG.selector).forEach((root) => {
    if (root.querySelector(".glow-field__skin")) mount(root, pointer.matches);
  });
}
