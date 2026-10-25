import { createFileRoute } from "@tanstack/react-router";
import { RefreshCw } from "lucide-react";
import { Button } from "~/components/button/button.component";
import { PageHeader } from "~/components/page-header/page-header.component";
import { Panel } from "~/components/panel/panel.component";
import { Select } from "~/components/select/select.component";
import { COPY } from "~/lib/copy/copy.config";
import { callStorageApi } from "~/lib/storage/storage.client";
import { STORAGE_API } from "~/lib/storage/storage.config";
import { CURRENCIES, MARKETPLACES, THEMES } from "~/lib/settings/settings.config";
import { usePriceQuery, useSettings } from "~/lib/settings/settings.store";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

const SELECT_WIDTH = "w-40";
const REFRESH_ICON_SIZE = 14;

function SettingsPage() {
  const { currency, marketplace, theme, setCurrency, setMarketplace, setTheme } = useSettings();
  const priceQuery = usePriceQuery();
  const copy = COPY.settings;
  return (
    <>
      <PageHeader title={copy.title} description={copy.description} />
      <div className="flex max-w-xl flex-col gap-3">
        <Panel title={copy.appearance}>
          <div className="flex items-center justify-between gap-4">
            {copy.theme}
            <Select
              value={theme}
              ariaLabel={copy.theme}
              className={SELECT_WIDTH}
              options={THEMES.map((t) => ({ id: t, label: copy.themes[t] }))}
              onChange={(id) => {
                const next = THEMES.find((t) => t === id);
                if (next) setTheme(next);
              }}
            />
          </div>
        </Panel>
        <Panel title={copy.currencyTitle}>
          <div className="flex items-center justify-between gap-4">
            {copy.currency}
            <Select
              value={currency}
              ariaLabel={copy.currency}
              className={SELECT_WIDTH}
              options={CURRENCIES.map((c) => ({ id: c, label: c }))}
              onChange={(id) => {
                const next = CURRENCIES.find((c) => c === id);
                if (next) setCurrency(next);
              }}
            />
          </div>
        </Panel>
        <Panel title={copy.marketplaceTitle}>
          <div className="flex items-center justify-between gap-4">
            {copy.marketplace}
            <Select
              value={marketplace}
              ariaLabel={copy.marketplace}
              className={SELECT_WIDTH}
              options={MARKETPLACES.map((m) => ({ id: m, label: copy.marketplaces[m] }))}
              onChange={(id) => {
                const next = MARKETPLACES.find((m) => m === id);
                if (next) setMarketplace(next);
              }}
            />
          </div>
          <p className="mt-3 text-muted-foreground">{copy.marketplaceHint}</p>
        </Panel>
        <Panel title={copy.dataTitle}>
          <p className="mb-3 text-muted-foreground">{copy.dataBody}</p>
          <Button onClick={() => void callStorageApi(`${STORAGE_API.refresh}?${priceQuery}`)}>
            <RefreshCw size={REFRESH_ICON_SIZE} aria-hidden />
            {copy.refreshData}
          </Button>
        </Panel>
      </div>
    </>
  );
}
