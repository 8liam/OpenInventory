import { useEffect, useRef, useState, type ReactNode } from "react";
import DashboardDemo from "@demo/demo/dashboard-demo";
import ItemsDemo from "@demo/demo/items-demo";
import StorageDemo from "@demo/demo/storage-demo";
import CasesDemo from "@demo/demo/cases-demo";
import TradeUpDemo from "@demo/demo/tradeup-demo";

export type LensId = "dashboard" | "items" | "storage" | "cases" | "tradeup";

type Lens = { id: LensId; label: string; caption: string };

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
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;
    const id = setInterval(() => {
      setActive((cur) => {
        const i = lenses.findIndex((l) => l.id === cur);
        return lenses[(i + 1) % lenses.length]?.id ?? cur;
      });
    }, 4200);
    return () => clearInterval(id);
  }, [enhanced, touched, onScreen, engaged, lenses]);

  const choose = (id: LensId) => {
    setTouched(true);
    setActive(id);
  };

  return (
    <div
      className={`lens${enhanced ? " is-enhanced" : ""}`}
      ref={rootRef}
      onPointerEnter={() => setEngaged(true)}
      onPointerLeave={() => setEngaged(false)}
      onFocus={() => setEngaged(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setEngaged(false);
      }}
    >
      <div className="lens__bar">
        <div className="seg" role={enhanced ? "tablist" : undefined} aria-label="Product views">
          {lenses.map((l) => {
            const on = l.id === active;
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
                  if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
                  e.preventDefault();
                  const i = lenses.findIndex((x) => x.id === l.id);
                  const next =
                    lenses[(i + (e.key === "ArrowRight" ? 1 : -1) + lenses.length) % lenses.length];
                  if (next) {
                    choose(next.id);
                    document.getElementById(`lens-tab-${next.id}`)?.focus();
                  }
                }}
              >
                {l.label}
              </button>
            );
          })}
        </div>
      </div>

      <p className="lens__caption" aria-live="polite">
        {lenses.find((l) => l.id === active)?.caption}
      </p>

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
              hidden={enhanced && !on}
            >
              <Demo />
            </div>
          );
        })}
      </div>
    </div>
  );
}
