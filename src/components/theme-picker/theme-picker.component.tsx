import type { CSSProperties } from "react";
import { PALETTE_LIST } from "~/lib/theme/palettes.config";
import { RESOLVED_SCHEMES } from "~/lib/theme/theme.config";
import type { ThemeVariant } from "~/lib/theme/theme.types";
import { cn } from "~/utils/cn";
import { useRadioGroup } from "~/utils/use-radio-group";
import { THEME_PICKER } from "./theme-picker.config";
import type { ThemePickerProps } from "./theme-picker.types";

const { classes } = THEME_PICKER;

/** The variant's background with soft pools of its primary and accent colours, like a glass ball. */
function orbBackground(variant: ThemeVariant): CSSProperties {
  const layers = THEME_PICKER.orbLayers.map(
    ([position, token, stop]) =>
      `radial-gradient(circle at ${position}, ${variant[token]} 0%, transparent ${stop}%)`,
  );
  return { background: `${layers.join(", ")}, ${variant.background}`, borderColor: variant.border };
}

/** The palettes as cards, each with a light and a dark orb; the chosen one gets accent rings. */
export function ThemePicker({ value, onChange, ariaLabel }: ThemePickerProps) {
  const group = useRadioGroup(
    PALETTE_LIST.map((palette) => palette.id),
    value,
    onChange,
  );
  return (
    <div role="radiogroup" aria-label={ariaLabel} className={classes.grid}>
      {PALETTE_LIST.map((palette, index) => {
        const selected = palette.id === value;
        return (
          <button
            key={palette.id}
            ref={group.register(index)}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={group.tabIndexFor(index)}
            onClick={() => onChange(palette.id)}
            onKeyDown={(event) => group.onKeyDown(event, index)}
            className={cn(classes.card, selected && classes.selected)}
          >
            <span className={classes.orbs} aria-hidden>
              {RESOLVED_SCHEMES.map((scheme) => {
                const Icon = THEME_PICKER.schemeIcons[scheme];
                return (
                  <span
                    key={scheme}
                    className={cn(classes.orb, selected && classes.orbSelected)}
                    style={orbBackground(palette[scheme])}
                  >
                    {selected && (
                      <span className={classes.badge}>
                        <Icon size={THEME_PICKER.orbIconSize} />
                      </span>
                    )}
                  </span>
                );
              })}
            </span>
            <span className={classes.name}>{palette.name}</span>
          </button>
        );
      })}
    </div>
  );
}
