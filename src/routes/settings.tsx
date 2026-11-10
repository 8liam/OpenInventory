import { createFileRoute } from "@tanstack/react-router";
import { AccountsPanel } from "~/components/accounts-panel/accounts-panel.component";
import { PageHeader } from "~/components/page-header/page-header.component";
import { SettingsAppearance } from "~/components/settings-appearance/settings-appearance.component";
import { SettingsData } from "~/components/settings-data/settings-data.component";
import { SettingsItems } from "~/components/settings-items/settings-items.component";
import { SettingsNav } from "~/components/settings-nav/settings-nav.component";
import { SettingsPricing } from "~/components/settings-pricing/settings-pricing.component";
import { COPY } from "~/lib/copy/copy.config";
import { SETTINGS_PAGE } from "~/lib/settings/settings-page.config";
import { DEFAULT_SETTINGS_TAB, SETTINGS_TABS } from "~/lib/settings/settings-tabs.config";
import { parseSettingsTab } from "~/lib/settings/settings-tabs";
import type { SettingsTab } from "~/lib/settings/settings-tabs.types";

export const Route = createFileRoute("/settings")({
  // `?tab=` picks the category so a section can be linked to; anything else shows the first.
  validateSearch: (search: Record<string, unknown>): { tab?: SettingsTab } => {
    const tab = parseSettingsTab(search.tab);
    return tab ? { tab } : {};
  },
  component: SettingsPage,
});

const TAB_CONTENT = {
  appearance: SettingsAppearance,
  items: SettingsItems,
  pricing: SettingsPricing,
  accounts: AccountsPanel,
  data: SettingsData,
} satisfies Record<SettingsTab, () => React.JSX.Element>;

function SettingsPage() {
  const { tab = DEFAULT_SETTINGS_TAB } = Route.useSearch();
  const navigate = Route.useNavigate();
  const copy = COPY.settings;
  const Content = TAB_CONTENT[tab];
  return (
    <>
      <PageHeader title={copy.title} description={copy.description} />
      <div className={SETTINGS_PAGE.scrollClass}>
        <div className={SETTINGS_PAGE.layoutClass}>
          <SettingsNav
            ariaLabel={copy.navLabel}
            value={tab}
            items={SETTINGS_TABS.map((id) => ({
              id,
              label: copy.tabs[id],
              icon: SETTINGS_PAGE.tabIcons[id],
            }))}
            onChange={(id) => void navigate({ search: { tab: id }, replace: true })}
          />
          <div className={SETTINGS_PAGE.contentClass}>
            <Content />
          </div>
        </div>
      </div>
    </>
  );
}
