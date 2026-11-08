import { useEffect, useRef, useState, type ReactNode } from "react";
import DashboardDemo from "@demo/demo/dashboard-demo";
import ItemsDemo from "@demo/demo/items-demo";
import StorageDemo from "@demo/demo/storage-demo";
import CasesDemo from "@demo/demo/cases-demo";
import TradeUpDemo from "@demo/demo/tradeup-demo";
import { DEMO_HEIGHT, DEMO_MIN_SCALE, DEMO_VISIBLE_WIDTH, DEMO_WIDTH } from "./feature-demo.config";

const DEMOS: Record<string, () => ReactNode> = {
  dashboard: DashboardDemo,
  items: ItemsDemo,
  storage: StorageDemo,
  cases: CasesDemo,
  tradeup: TradeUpDemo,
};

/**
 * One real OpenInventory page, live on the sample account, laid out at desktop size and scaled
 * down into a cropped panel so it reads like a screenshot but still responds to clicks.
 */
export default function FeatureDemo({ id }: { id: string }) {
  const Demo = DEMOS[id];
  const boxRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openRef = useRef<HTMLButtonElement>(null);
  const [scale, setScale] = useState(DEMO_MIN_SCALE);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const fit = () => setScale(Math.max(DEMO_MIN_SCALE, el.clientWidth / DEMO_VISIBLE_WIDTH));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (expanded) dialogRef.current?.showModal();
  }, [expanded]);

  if (!Demo) return null;
  return (
    <div className="fdemo" ref={boxRef} style={{ minHeight: DEMO_HEIGHT * scale }}>
      <div
        className="fdemo__inner"
        style={{ width: DEMO_WIDTH, height: DEMO_HEIGHT, transform: `scale(${scale})` }}
      >
        <Demo />
      </div>
      <button ref={openRef} type="button" className="fdemo__open" onClick={() => setExpanded(true)}>
        Explore full {id} demo
      </button>
      {expanded && (
        <dialog
          ref={dialogRef}
          className="fdemo__dialog"
          aria-label={`${id} demo`}
          onClose={() => {
            setExpanded(false);
            openRef.current?.focus();
          }}
        >
          <div className="fdemo__dialog-head">
            <span>OpenInventory · {id} demo</span>
            <button type="button" onClick={() => dialogRef.current?.close()}>
              Close demo
            </button>
          </div>
          <div className="fdemo__dialog-body" data-lenis-prevent>
            <Demo />
          </div>
        </dialog>
      )}
    </div>
  );
}
