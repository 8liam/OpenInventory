import { Select } from "~/components/select/select.component";
import { SettingsRow } from "~/components/settings-row/settings-row.component";
import { SettingsSection } from "~/components/settings-section/settings-section.component";
import { COPY } from "~/lib/copy/copy.config";
import { CURRENCIES, MARKETPLACES } from "~/lib/settings/settings.config";
import { useSettings } from "~/lib/settings/settings.store";
import { SETTINGS_PAGE } from "~/lib/settings/settings-page.config";

/** Settings > Pricing: the currency prices are shown in and the marketplace they come from. */
export function SettingsPricing() {
  const { currency, marketplace, setCurrency, setMarketplace } = useSettings();
  const copy = COPY.settings.pricing;
  return (
    <SettingsSection title={copy.title}>
      <SettingsRow label={copy.currency} description={copy.currencyHint}>
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
      </SettingsRow>
      <SettingsRow label={copy.marketplace} description={copy.marketplaceHint}>
        <Select
          value={marketplace}
          ariaLabel={copy.marketplace}
          className={SETTINGS_PAGE.selectWidth}
          options={MARKETPLACES.map((m) => ({ id: m, label: COPY.settings.marketplaces[m] }))}
          onChange={(id) => {
            const next = MARKETPLACES.find((m) => m === id);
            if (next) setMarketplace(next);
          }}
        />
      </SettingsRow>
    </SettingsSection>
  );
}
