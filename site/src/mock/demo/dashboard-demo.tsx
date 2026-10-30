import { PortfolioHero } from '~/components/portfolio-hero/portfolio-hero.component';
import { BreakdownPanel } from '~/components/breakdown-panel/breakdown-panel.component';
import { DASHBOARD_MOCK } from '~/data/dashboard.mock';
import { MOCK_CURRENCY } from '~/data/mock.config';

/** The real PortfolioHero and BreakdownPanel from OpenInventory, fed sample data. */
export default function DashboardDemo() {
  return (
    <div className="oi-app flex flex-col gap-3 p-3">
      <PortfolioHero dashboard={DASHBOARD_MOCK} currency={MOCK_CURRENCY} />
      <BreakdownPanel dashboard={DASHBOARD_MOCK} currency={MOCK_CURRENCY} />
    </div>
  );
}
