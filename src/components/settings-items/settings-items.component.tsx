import { SegmentedControl } from "~/components/segmented-control/segmented-control.component";
import { Select } from "~/components/select/select.component";
import { SettingsRow } from "~/components/settings-row/settings-row.component";
import { SettingsSection } from "~/components/settings-section/settings-section.component";
import { COPY } from "~/lib/copy/copy.config";
import { ITEM_SORTS } from "~/lib/items/item-sort.config";
import { useItemViewMode } from "~/lib/items/view-mode.store";
import { ITEM_VIEW_MODES } from "~/lib/items/view-mode.types";
import { FLOAT_THRESHOLD_IDS } from "~/lib/settings/settings.config";
import { useSettings } from "~/lib/settings/settings.store";
import { SETTINGS_PAGE } from "~/lib/settings/settings-page.config";

/** Settings > Items: default view and sort, and how float highlights are judged. */
export function SettingsItems() {
  const { defaultSort, floatThreshold, setDefaultSort, setFloatThreshold } = useSettings();
  const { mode, setMode } = useItemViewMode();
  const copy = COPY.settings.items;
  return (
    <>
      <SettingsSection title={copy.title}>
        <SettingsRow label={copy.defaultView} description={copy.defaultViewHint}>
          <SegmentedControl
            value={mode}
            ariaLabel={copy.defaultView}
            options={ITEM_VIEW_MODES.map((id) => ({ id, label: copy.views[id] }))}
            onChange={setMode}
          />
        </SettingsRow>
        <SettingsRow label={copy.defaultSort} description={copy.defaultSortHint}>
          <Select
            value={defaultSort}
            ariaLabel={copy.defaultSort}
            className={SETTINGS_PAGE.selectWidth}
            options={ITEM_SORTS.map(({ id, label }) => ({ id, label }))}
            onChange={(id) => {
              const next = ITEM_SORTS.find((sort) => sort.id === id);
              if (next) setDefaultSort(next.id);
            }}
          />
        </SettingsRow>
      </SettingsSection>
      <SettingsSection title={copy.floatTitle}>
        <SettingsRow label={copy.float} description={copy.floatHint}>
          <SegmentedControl
            value={floatThreshold}
            ariaLabel={copy.float}
            options={FLOAT_THRESHOLD_IDS.map((id) => ({
              id,
              label: id === "off" ? copy.floatOff : copy.floatPercent(id),
            }))}
            onChange={setFloatThreshold}
          />
        </SettingsRow>
      </SettingsSection>
    </>
  );
}
