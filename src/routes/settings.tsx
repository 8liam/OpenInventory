import { createFileRoute } from "@tanstack/react-router";
import { RefreshCw } from "lucide-react";
import { AccountsPanel } from "~/components/accounts-panel/accounts-panel.component";
import { Button } from "~/components/button/button.component";
import { PageHeader } from "~/components/page-header/page-header.component";
import { Panel } from "~/components/panel/panel.component";
import { Select } from "~/components/select/select.component";
import { COPY } from "~/lib/copy/copy.config";
import { useRefreshAccounts } from "~/lib/accounts/refresh-accounts.hooks";
import { CURRENCIES, MARKETPLACES, THEMES } from "~/lib/settings/settings.config";
import { useSettings } from "~/lib/settings/settings.store";
import { SETTINGS_PAGE } from "~/lib/settings/settings-page.config";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

function SettingsPage() {
  const { currency, marketplace, theme, setCurrency, setMarketplace, setTheme } = useSettings();
  const refresh = useRefreshAccounts();
  const copy = COPY.settings;
  return (
    <>
      <PageHeader title={copy.title} description={copy.description} />
      <div className={SETTINGS_PAGE.scrollClass}>
        <div className={SETTINGS_PAGE.columnClass}>
          <AccountsPanel />
          <Panel title={copy.appearance}>
            <div className="flex items-center justify-between gap-4">
              {copy.theme}
              <Select
                value={theme}
                ariaLabel={copy.theme}
                className={SETTINGS_PAGE.selectWidth}
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
                className={SETTINGS_PAGE.selectWidth}
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
                className={SETTINGS_PAGE.selectWidth}
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
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <Button
                disabled={refresh.busy || !refresh.canRefresh}
                onClick={() => void refresh.refresh()}
              >
                <RefreshCw
                  size={SETTINGS_PAGE.refreshIconSize}
                  className={refresh.busy ? "motion-safe:animate-spin" : undefined}
                  aria-hidden
                />
                {refresh.busy ? COPY.common.refreshing : copy.refreshData}
              </Button>
              <span className="text-xs text-muted-foreground">
                {COPY.refresh.scope(refresh.scopeLabel)}
              </span>
            </div>
            {refresh.skipped > 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                {COPY.refresh.skipped(refresh.skipped)}
              </p>
            )}
            {refresh.error && (
              <p role="alert" className="mt-2 text-xs text-destructive">
                {refresh.error}
              </p>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
