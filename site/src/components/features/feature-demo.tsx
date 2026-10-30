import { useEffect, useRef, useState, type ReactNode } from 'react';
import DashboardDemo from '@demo/demo/dashboard-demo';
import ItemsDemo from '@demo/demo/items-demo';
import StorageDemo from '@demo/demo/storage-demo';
import CasesDemo from '@demo/demo/cases-demo';
import TradeUpDemo from '@demo/demo/tradeup-demo';
import { DEMO_HEIGHT, DEMO_MIN_SCALE, DEMO_VISIBLE_WIDTH, DEMO_WIDTH } from './feature-demo.config';

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
  const [scale, setScale] = useState(DEMO_MIN_SCALE);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const fit = () => setScale(Math.max(DEMO_MIN_SCALE, el.clientWidth / DEMO_VISIBLE_WIDTH));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (!Demo) return null;
  return (
    <div className="fdemo" ref={boxRef} style={{ minHeight: DEMO_HEIGHT * scale }}>
      <div className="fdemo__inner" style={{ width: DEMO_WIDTH, height: DEMO_HEIGHT, transform: `scale(${scale})` }}>
        <Demo />
      </div>
    </div>
  );
}
