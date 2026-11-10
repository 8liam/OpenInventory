import { Check } from "lucide-react";
import { PALETTE_LIST } from "~/lib/theme/palettes.config";
import { cn } from "~/utils/cn";
import { useRadioGroup } from "~/utils/use-radio-group";
import { THEME_PICKER } from "./theme-picker.config";
import type { ThemePickerProps } from "./theme-picker.types";

/** The palettes as preview cards: name plus its background, card, accent and primary colours. */
export function ThemePicker({ value, onChange, scheme, ariaLabel }: ThemePickerProps) {
  const group = useRadioGroup(
    PALETTE_LIST.map((palette) => palette.id),
    value,
    onChange,
  );
  return (
    <div role="radiogroup" aria-label={ariaLabel} className={THEME_PICKER.gridClass}>
      {PALETTE_LIST.map((palette, index) => {
        const selected = palette.id === value;
        const variant = palette[scheme];
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
            className={cn(THEME_PICKER.cardClass, selected && THEME_PICKER.selectedClass)}
          >
            <span className={THEME_PICKER.nameClass}>{palette.name}</span>
            <span className={THEME_PICKER.swatchRowClass} aria-hidden>
              {THEME_PICKER.swatches.map((token) => (
                <span
                  key={token}
                  className={THEME_PICKER.swatchClass}
                  style={{ backgroundColor: variant[token] }}
                />
              ))}
            </span>
            {selected && (
              <Check
                size={THEME_PICKER.checkIconSize}
                className={THEME_PICKER.checkClass}
                aria-hidden
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
