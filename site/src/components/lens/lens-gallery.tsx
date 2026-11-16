import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { LayoutDashboard, Package, Archive, Briefcase, ArrowUpRight } from "lucide-react";
import {
  LENS_ROTATION_MS,
  LENS_CANVAS_WIDTH,
  LENS_TABLIST_LABEL,
  LENS_ICON_SIZE,
  LENS_ICON_STROKE,
  LENS_REDUCED_MOTION_QUERY,
  LENS_NAV_KEYS,
} from "./lens.config";
import type { Lens, LensId } from "./lens.types";
import DashboardDemo from "@demo/demo/dashboard-demo";
import ItemsDemo from "@demo/demo/items-demo";
import StorageDemo from "@demo/demo/storage-demo";
import CasesDemo from "@demo/demo/cases-demo";
import TradeUpDemo from "@demo/demo/tradeup-demo";

export type { LensId } from "./lens.types";

const ICONS = {
  dashboard: LayoutDashboard,
  items: Package,
  storage: Archive,
  cases: Briefcase,
  tradeup: ArrowUpRight,
};

const DEMOS: Record<LensId, () => ReactNode> = {
  dashboard: DashboardDemo,
  items: ItemsDemo,
  storage: StorageDemo,
  cases: CasesDemo,
  tradeup: TradeUpDemo,
};

/**
 * The hero's live product stage. One sample account, five views.
 * Without JS every view renders stacked so the content is complete. With JS it becomes a
 * segmented control that wipes between views. Auto-advances slowly until the visitor touches
 * it, then stops for good.
 */
export default function LensGallery({ lenses }: { lenses: readonly Lens[] }) {
  const [active, setActive] = useState<LensId>(lenses[0]?.id ?? "dashboard");
  const [touched, setTouched] = useState(false);
  const [enhanced, setEnhanced] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [engaged, setEngaged] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => setEnhanced(true), []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const resize = () =>
      stage.style.setProperty(
        "--lens-scale",
        String(Math.min(1, stage.clientWidth / LENS_CANVAS_WIDTH)),
      );
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  // Rotate only while someone can see it: the stage is often scrolled past on a phone,
  // and a demo nobody is watching should not be re-rendering.
  useEffect(() => {
    const el = rootRef.current;
    if (!el || !("IntersectionObserver" in window)) {
      setOnScreen(true);
      return;
    }
    const io = new IntersectionObserver((entries) =>
      setOnScreen(entries.some((e) => e.isIntersecting)),
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Auto-advance until the visitor interacts — and stand down while their pointer or
  // keyboard is already inside the control, so rotation never fires mid-decision.
  useEffect(() => {
    if (!enhanced || touched || !onScreen || engaged) return;
    const mq = matchMedia(LENS_REDUCED_MOTION_QUERY);
    let id: ReturnType<typeof setInterval> | undefined;
    const sync = () => {
      clearInterval(id);
      if (mq.matches) return;
      id = setInterval(() => {
        setActive((cur) => {
          const i = lenses.findIndex((l) => l.id === cur);
          return lenses[(i + 1) % lenses.length]?.id ?? cur;
        });
      }, LENS_ROTATION_MS);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => {
      clearInterval(id);
      mq.removeEventListener("change", sync);
    };
  }, [enhanced, touched, onScreen, engaged, lenses]);

  const activeLens = lenses.find((l) => l.id === active);

  const choose = (id: LensId) => {
    setTouched(true);
    setActive(id);
  };

  return (
    <div
      className={`lens${enhanced ? " is-enhanced" : ""}`}
      ref={rootRef}
      onPointerDown={() => setTouched(true)}
      onKeyDown={() => setTouched(true)}
      onPointerEnter={() => setEngaged(true)}
      onPointerLeave={() => setEngaged(false)}
      onFocus={() => setEngaged(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setEngaged(false);
      }}
    >
      <div className="lens__bar">
        <div
          className="seg"
          role={enhanced ? "tablist" : undefined}
          aria-label={LENS_TABLIST_LABEL}
          style={
            {
              "--lens-index": Math.max(
                0,
                lenses.findIndex((l) => l.id === active),
              ),
              "--lens-count": lenses.length,
            } as CSSProperties
          }
        >
          <span className="seg__thumb" aria-hidden="true" />
          {lenses.map((l) => {
            const on = l.id === active;
            const Icon = ICONS[l.id];
            return (
              <button
                key={l.id}
                type="button"
                role={enhanced ? "tab" : undefined}
                aria-selected={enhanced ? on : undefined}
                aria-controls={`lens-panel-${l.id}`}
                id={`lens-tab-${l.id}`}
                tabIndex={enhanced && !on ? -1 : undefined}
                className={`seg__btn${on ? " is-on" : ""}`}
                onClick={() => choose(l.id)}
                onKeyDown={(e) => {
                  if (!Object.values(LENS_NAV_KEYS).some((k) => k === e.key)) return;
                  e.preventDefault();
                  const i = lenses.findIndex((x) => x.id === l.id);
                  const step = e.key === LENS_NAV_KEYS.next ? 1 : -1;
                  const target =
                    e.key === LENS_NAV_KEYS.first
                      ? 0
                      : e.key === LENS_NAV_KEYS.last
                        ? lenses.length - 1
                        : (i + step + lenses.length) % lenses.length;
                  const next = lenses[target];
                  if (next) {
                    choose(next.id);
                    document.getElementById(`lens-tab-${next.id}`)?.focus();
                  }
                }}
              >
                <Icon aria-hidden="true" size={LENS_ICON_SIZE} strokeWidth={LENS_ICON_STROKE} />
                <span>{l.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="lens__device">
        <div className="lens__stage" ref={stageRef}>
          {lenses.map((l) => {
            const Demo = DEMOS[l.id];
            const on = l.id === active;
            return (
              <div
                key={l.id}
                id={`lens-panel-${l.id}`}
                role={enhanced ? "tabpanel" : undefined}
                aria-labelledby={enhanced ? `lens-tab-${l.id}` : undefined}
                className={`lens__panel${on ? " is-on" : ""}`}
                tabIndex={enhanced ? 0 : undefined}
                hidden={enhanced && !on}
              >
                <Demo />
              </div>
            );
          })}
        </div>
      </div>
      <p className="lens__caption" aria-live={touched ? "polite" : "off"}>
        <span className="lens__caption-dot" aria-hidden="true" />
        <span className="lens__caption-text">{activeLens?.caption}</span>
      </p>
    </div>
  );
}
