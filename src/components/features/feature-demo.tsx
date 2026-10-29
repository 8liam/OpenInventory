import type { ReactNode } from 'react';
import DashboardDemo from '../../mock/demo/dashboard-demo';
import ItemsDemo from '../../mock/demo/items-demo';
import StorageDemo from '../../mock/demo/storage-demo';
import CasesDemo from '../../mock/demo/cases-demo';
import TradeUpDemo from '../../mock/demo/tradeup-demo';

const DEMOS: Record<string, () => ReactNode> = {
  dashboard: DashboardDemo,
  items: ItemsDemo,
  storage: StorageDemo,
  cases: CasesDemo,
  tradeup: TradeUpDemo,
};

/** One real OpenInventory page, running on the sample account, for a feature chapter. */
export default function FeatureDemo({ id }: { id: string }) {
  const Demo = DEMOS[id];
  return Demo ? <Demo /> : null;
}
