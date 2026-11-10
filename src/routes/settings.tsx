import { createFileRoute } from "@tanstack/react-router";
import { RefreshCw } from "lucide-react";
import { AccountsPanel } from "~/components/accounts-panel/accounts-panel.component";
import { Button } from "~/components/button/button.component";
import { PageHeader } from "~/components/page-header/page-header.component";
import { Panel } from "~/components/panel/panel.component";
import { Select } from "~/components/select/select.component";
import { COPY } from "~/lib/copy/copy.config";
import { useRefreshAccounts } from "~/lib/accounts/refresh-accounts.hooks";
import { CURRENCIES, MARKETPLACES } from "~/lib/settings/settings.config";
import { PALETTE_LIST } from "~/lib/theme/palettes.config";
import { COLOR_SCHEMES, PALETTE_IDS } from "~/lib/theme/theme.config";
import { useSettings } from "~/lib/settings/settings.store";
import { SETTINGS_PAGE } from "~/lib/settings/settings-page.config";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

function SettingsPage() {
  const {
    currency,
    marketplace,
    colorScheme,
    palette,
    setCurrency,
    setMarketplace,
    setColorScheme,
    setPalette,
  } = useSettings();
  const refresh = useRefreshAccounts();
  const copy = COPY.settings;
  const { classes } = SETTINGS_PAGE;
  const dataPanel = (
    <Panel title={copy.dataTitle}>
      <p className={classes.body}>{copy.dataBody}</p>
      <div className={classes.refreshRow}>
        <Button
          disabled={refresh.busy || !refresh.canRefresh}
          onClick={() => void refresh.refresh()}
        >
          <RefreshCw
            size={SETTINGS_PAGE.refreshIconSize}
            className={refresh.busy ? classes.spinning : undefined}
            aria-hidden
          />
          {refresh.busy ? COPY.common.refreshing : copy.refreshData}
        </Button>
        <span className={classes.scope}>{COPY.refresh.scope(refresh.scopeLabel)}</span>
      </div>
      {refresh.skipped > 0 && (
        <p className={classes.skipped}>{COPY.refresh.skipped(refresh.skipped)}</p>
      )}
      {refresh.error && (
        <p role="alert" className={classes.error}>
          {refresh.error}
        </p>
      )}
    </Panel>
  );
  return (
    <>
      <PageHeader title={copy.title} description={copy.description} />
      <div className={SETTINGS_PAGE.scrollClass}>
        <div className={SETTINGS_PAGE.layoutClass}>
          <div className={SETTINGS_PAGE.columnClass}>
            <AccountsPanel />
            {dataPanel}
          </div>
          <div className={SETTINGS_PAGE.columnClass}>
            <Panel title={copy.appearance}>
              <div className={classes.field}>
                {copy.colorScheme}
                <Select
                  value={colorScheme}
                  ariaLabel={copy.colorScheme}
                  className={SETTINGS_PAGE.selectWidth}
                  options={COLOR_SCHEMES.map((c) => ({ id: c, label: copy.colorSchemes[c] }))}
                  onChange={(id) => {
                    const next = COLOR_SCHEMES.find((c) => c === id);
                    if (next) setColorScheme(next);
                  }}
                />
              </div>
              <div className={classes.field}>
                {copy.palette}
                <Select
                  value={palette}
                  ariaLabel={copy.palette}
                  className={SETTINGS_PAGE.selectWidth}
                  options={PALETTE_LIST.map((p) => ({ id: p.id, label: p.name }))}
                  onChange={(id) => {
                    const next = PALETTE_IDS.find((p) => p === id);
                    if (next) setPalette(next);
                  }}
                />
              </div>
            </Panel>
            <Panel title={copy.currencyTitle}>
              <div className={classes.field}>
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
              <div className={classes.field}>
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
              <p className={classes.hint}>{copy.marketplaceHint}</p>
            </Panel>
          </div>
        </div>
      </div>
    </>
  );
}
