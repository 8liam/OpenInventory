import { useRef, type KeyboardEvent } from "react";
import { cn } from "~/utils/cn";
import { RARITY_PICKER } from "./rarity-picker.config";
import type { RarityPickerProps } from "./rarity-picker.types";

const { classes } = RARITY_PICKER;

/**
 * A row of rarity-coloured circles acting as a radio group. The chosen rarity is also written out
 * next to the circles, so colour is never the only cue (and touch screens, with no hover, see it).
 */
export function RarityPicker({ label, options, value, onChange }: RarityPickerProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const selected = Math.max(
    0,
    options.findIndex((option) => option.id === value),
  );

  function onKeyDown(event: KeyboardEvent, index: number) {
    const step = RARITY_PICKER.keys.next.includes(event.key)
      ? 1
      : RARITY_PICKER.keys.previous.includes(event.key)
        ? -1
        : 0;
    if (step === 0) return;
    event.preventDefault();
    const target = (index + step + options.length) % options.length;
    const option = options[target];
    if (!option) return;
    onChange(option.id);
    refs.current[target]?.focus();
  }

  return (
    <div className={classes.root}>
      <span>{label}</span>
      <div role="radiogroup" aria-label={label} className={classes.group}>
        {options.map((option, index) => {
          const active = index === selected;
          return (
            <button
              key={option.id}
              ref={(element) => {
                refs.current[index] = element;
              }}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={option.label}
              tabIndex={active ? 0 : -1}
              onClick={() => onChange(option.id)}
              onKeyDown={(event) => onKeyDown(event, index)}
              style={{ backgroundColor: option.color, color: option.color }}
              className={cn(classes.option, active && classes.optionActive)}
            >
              <span role="tooltip" className={classes.tooltip}>
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
      <span aria-hidden className={classes.current}>
        {options[selected]?.label}
      </span>
    </div>
  );
}
