import { Check } from "lucide-react";
import { ACCENT_COLORS, ACCENT_IDS } from "~/lib/theme/theme.config";
import { accentOverrides } from "~/lib/theme/theme";
import { cn } from "~/utils/cn";
import { useRadioGroup } from "~/utils/use-radio-group";
import { ACCENT_PICKER } from "./accent-picker.config";
import type { AccentPickerProps } from "./accent-picker.types";

/** "Theme default" plus one round swatch per accent colour. */
export function AccentPicker({ value, onChange, ariaLabel, labels }: AccentPickerProps) {
  const group = useRadioGroup(ACCENT_IDS, value, onChange);
  return (
    <div role="radiogroup" aria-label={ariaLabel} className={ACCENT_PICKER.groupClass}>
      {ACCENT_IDS.map((id, index) => {
        const selected = id === value;
        const overrides = accentOverrides(id);
        return (
          <button
            key={id}
            ref={group.register(index)}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={labels[id]}
            title={labels[id]}
            tabIndex={group.tabIndexFor(index)}
            onClick={() => onChange(id)}
            onKeyDown={(event) => group.onKeyDown(event, index)}
            style={id === "default" ? undefined : { backgroundColor: ACCENT_COLORS[id] }}
            className={cn(
              ACCENT_PICKER.swatchClass,
              id === "default" && ACCENT_PICKER.defaultSwatchClass,
              selected && ACCENT_PICKER.selectedClass,
            )}
          >
            {id === "default" && labels[id]}
            {selected && id !== "default" && (
              <Check
                size={ACCENT_PICKER.checkIconSize}
                style={overrides ? { color: overrides["primary-foreground"] } : undefined}
                aria-hidden
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
