import { SchemePreview } from "~/components/scheme-preview/scheme-preview.component";
import { COLOR_SCHEMES } from "~/lib/theme/theme.config";
import { cn } from "~/utils/cn";
import { useRadioGroup } from "~/utils/use-radio-group";
import { COLOR_SCHEME_PICKER } from "./color-scheme-picker.config";
import type { ColorSchemePickerProps } from "./color-scheme-picker.types";

const { classes } = COLOR_SCHEME_PICKER;

/** System, light and dark as preview cards, painted in the chosen palette. */
export function ColorSchemePicker({
  value,
  onChange,
  palette,
  labels,
  ariaLabel,
}: ColorSchemePickerProps) {
  const group = useRadioGroup(COLOR_SCHEMES, value, onChange);
  return (
    <div role="radiogroup" aria-label={ariaLabel} className={classes.group}>
      {COLOR_SCHEMES.map((scheme, index) => (
        <button
          key={scheme}
          ref={group.register(index)}
          type="button"
          role="radio"
          aria-checked={scheme === value}
          tabIndex={group.tabIndexFor(index)}
          onClick={() => onChange(scheme)}
          onKeyDown={(event) => group.onKeyDown(event, index)}
          className={cn(classes.card, scheme === value && classes.selected)}
        >
          <SchemePreview
            variants={{ light: palette.light, dark: palette.dark }}
            mode={COLOR_SCHEME_PICKER.previewMode[scheme]}
          />
          <span className={classes.label}>{labels[scheme]}</span>
        </button>
      ))}
    </div>
  );
}
