import { AccentPicker } from "~/components/accent-picker/accent-picker.component";
import { ColorSchemePicker } from "~/components/color-scheme-picker/color-scheme-picker.component";
import { SettingsSection } from "~/components/settings-section/settings-section.component";
import { ThemePicker } from "~/components/theme-picker/theme-picker.component";
import { COPY } from "~/lib/copy/copy.config";
import { useSettings } from "~/lib/settings/settings.store";
import { getPalette } from "~/lib/theme/theme";
import { SETTINGS_APPEARANCE } from "./settings-appearance.config";

/** Settings > Appearance: colour scheme, theme palette and accent colour. */
export function SettingsAppearance() {
  const { colorScheme, palette, accent, setColorScheme, setPalette, setAccent } = useSettings();
  const copy = COPY.settings.appearance;
  return (
    <div className={SETTINGS_APPEARANCE.stackClass}>
      <SettingsSection title={copy.colorScheme} plain>
        <ColorSchemePicker
          value={colorScheme}
          ariaLabel={copy.colorScheme}
          palette={getPalette(palette)}
          labels={copy.colorSchemes}
          onChange={setColorScheme}
        />
      </SettingsSection>
      <SettingsSection title={copy.palette} plain>
        <ThemePicker value={palette} ariaLabel={copy.palette} onChange={setPalette} />
      </SettingsSection>
      <SettingsSection title={copy.accent} description={copy.accentHint} plain>
        <AccentPicker
          value={accent}
          ariaLabel={copy.accent}
          labels={copy.accents}
          onChange={setAccent}
        />
      </SettingsSection>
    </div>
  );
}
