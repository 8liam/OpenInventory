import { AccentPicker } from "~/components/accent-picker/accent-picker.component";
import { SegmentedControl } from "~/components/segmented-control/segmented-control.component";
import { SettingsRow } from "~/components/settings-row/settings-row.component";
import { SettingsSection } from "~/components/settings-section/settings-section.component";
import { ThemePicker } from "~/components/theme-picker/theme-picker.component";
import { COPY } from "~/lib/copy/copy.config";
import { useSettings } from "~/lib/settings/settings.store";
import { COLOR_SCHEMES, DARK_MEDIA_QUERY } from "~/lib/theme/theme.config";
import { resolveColorScheme } from "~/lib/theme/theme";
import { useMediaQuery } from "~/utils/use-media-query";

/** Settings > Appearance: colour scheme, theme palette and accent colour. */
export function SettingsAppearance() {
  const { colorScheme, palette, accent, setColorScheme, setPalette, setAccent } = useSettings();
  const systemPrefersDark = useMediaQuery(DARK_MEDIA_QUERY);
  const copy = COPY.settings.appearance;
  return (
    <SettingsSection title={copy.title}>
      <SettingsRow label={copy.colorScheme} description={copy.colorSchemeHint}>
        <SegmentedControl
          value={colorScheme}
          ariaLabel={copy.colorScheme}
          options={COLOR_SCHEMES.map((id) => ({ id, label: copy.colorSchemes[id] }))}
          onChange={setColorScheme}
        />
      </SettingsRow>
      <SettingsRow label={copy.palette} description={copy.paletteHint} stacked>
        <ThemePicker
          value={palette}
          ariaLabel={copy.palette}
          scheme={resolveColorScheme(colorScheme, systemPrefersDark)}
          onChange={setPalette}
        />
      </SettingsRow>
      <SettingsRow label={copy.accent} description={copy.accentHint} stacked>
        <AccentPicker
          value={accent}
          ariaLabel={copy.accent}
          labels={copy.accents}
          onChange={setAccent}
        />
      </SettingsRow>
    </SettingsSection>
  );
}
