import { createFileRoute } from "@tanstack/react-router";
import { Button } from "~/components/button/button.component";
import { PageHeader } from "~/components/page-header/page-header.component";
import { Panel } from "~/components/panel/panel.component";
import { COPY } from "~/lib/copy/copy.config";
import { callStorageApi } from "~/lib/storage/storage.client";
import { STORAGE_API } from "~/lib/storage/storage.config";
import { CURRENCIES, THEMES } from "~/lib/settings/settings.config";
import { useSettings } from "~/lib/settings/settings.store";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

const SELECT_CLASS = "h-8 rounded-md border border-input bg-card px-2.5 outline-none";

function SettingsPage() {
  const { currency, theme, setCurrency, setTheme } = useSettings();
  const copy = COPY.settings;
  return (
    <>
      <PageHeader title={copy.title} description={copy.description} />
      <div className="flex max-w-xl flex-col gap-3">
        <Panel title={copy.appearance}>
          <label className="flex items-center justify-between gap-4">
            {copy.theme}
            <select
              value={theme}
              onChange={(e) => {
                const next = THEMES.find((t) => t === e.target.value);
                if (next) setTheme(next);
              }}
              className={SELECT_CLASS}
            >
              {THEMES.map((t) => (
                <option key={t} value={t}>
                  {copy.themes[t]}
                </option>
              ))}
            </select>
          </label>
        </Panel>
        <Panel title={copy.currencyTitle}>
          <label className="flex items-center justify-between gap-4">
            {copy.currency}
            <select
              value={currency}
              onChange={(e) => {
                const next = CURRENCIES.find((c) => c === e.target.value);
                if (next) setCurrency(next);
              }}
              className={SELECT_CLASS}
            >
              {CURRENCIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        </Panel>
        <Panel title={copy.dataTitle}>
          <p className="mb-3 text-muted-foreground">{copy.dataBody}</p>
          <Button
            onClick={() => void callStorageApi(`${STORAGE_API.refresh}?currency=${currency}`)}
          >
            {copy.refreshData}
          </Button>
        </Panel>
      </div>
    </>
  );
}
