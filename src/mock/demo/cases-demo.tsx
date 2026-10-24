import { useMemo, useState } from 'react';
import { BarList } from '~/components/bar-list/bar-list.component';
import { CaseSummary } from '~/components/case-summary/case-summary.component';
import { DonutChart } from '~/components/donut-chart/donut-chart.component';
import { KindPills } from '~/components/kind-pills/kind-pills.component';
import { MonthlyBars } from '~/components/monthly-bars/monthly-bars.component';
import { OpeningList } from '~/components/opening-list/opening-list.component';
import { PageHeader } from '~/components/page-header/page-header.component';
import { Panel } from '~/components/panel/panel.component';
import { casesResponse } from '~/data/cases.mock';
import { DEFAULT_OPENING_KIND } from '~/lib/cases/cases.config';
import type { OpeningKind } from '~/lib/cases/cases.types';
import { COPY } from '~/lib/copy/copy.config';

/** The real Cases page body on sample history; the kind pills switch the whole page like the app does. */
export default function CasesDemo() {
  const copy = COPY.cases;
  const [kind, setKind] = useState<OpeningKind>(DEFAULT_OPENING_KIND);
  const { stats } = useMemo(() => casesResponse(kind), [kind]);
  const raritySlices = stats.rarity.map((r) => ({ label: r.label, value: r.count, count: r.count, color: `#${r.color}` }));
  return (
    <div className="oi-app flex flex-col gap-3 p-4">
      <PageHeader title={copy.title} description={copy.description} />
      <KindPills selected={kind} counts={stats.kindCounts} onSelect={setKind} />
      <CaseSummary stats={stats} />
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
        <Panel title={copy.rarityTitle} className="lg:col-span-2">
          <DonutChart slices={raritySlices} currency="" totalLabel={copy.kinds[kind].headline} formatValue={(n) => String(n)} />
          <div className="mt-5">
            <BarList slices={raritySlices} currency="" showValue={false} />
          </div>
        </Panel>
        <div className="flex flex-col gap-3 lg:col-span-3">
          <Panel title={copy.monthlyTitle}>
            <MonthlyBars months={stats.perMonth} />
          </Panel>
          <Panel title={copy.rarestTitle}>
            <OpeningList openings={stats.rarest} emptyText={copy.empty} />
          </Panel>
        </div>
      </div>
    </div>
  );
}
