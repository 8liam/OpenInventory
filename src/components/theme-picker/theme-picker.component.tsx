import { FlashBurst } from "~/components/flash-burst/flash-burst.component";
import { Flashbang } from "~/components/flashbang/flashbang.component";
import { PALETTE_LIST } from "~/lib/theme/palettes.config";
import { cn } from "~/utils/cn";
import { useRadioGroup } from "~/utils/use-radio-group";
import { THEME_PICKER } from "./theme-picker.config";
import type { ThemePickerProps } from "./theme-picker.types";

const { classes } = THEME_PICKER;

/** The palettes as a shelf of flashbangs; the chosen one tilts up and goes off in its own colours. */
export function ThemePicker({ value, onChange, scheme, ariaLabel }: ThemePickerProps) {
  const group = useRadioGroup(
    PALETTE_LIST.map((palette) => palette.id),
    value,
    onChange,
  );
  return (
    <div role="radiogroup" aria-label={ariaLabel} className={classes.shelf}>
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
            className={classes.cell}
          >
            <span className={classes.stage}>
              <FlashBurst
                variant={variant}
                className={cn(classes.burst, selected && classes.burstOn)}
              />
              <Flashbang
                variant={variant}
                angle={selected ? THEME_PICKER.angle.chosen : THEME_PICKER.angle.idle}
                className={cn(classes.nade, selected && classes.nadeOn)}
              />
            </span>
            <span className={classes.plank} aria-hidden />
            <span className={cn(classes.name, selected && classes.nameOn)}>{palette.name}</span>
          </button>
        );
      })}
    </div>
  );
}
