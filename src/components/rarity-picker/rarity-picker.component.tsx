import { useRef, type KeyboardEvent } from "react";
import { cn } from "~/utils/cn";
import { RARITY_PICKER } from "./rarity-picker.config";
import type { RarityPickerProps } from "./rarity-picker.types";

/** A row of rarity-coloured circles acting as a radio group; the name shows on hover or focus. */
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
    <div className="flex items-center gap-2.5 text-muted-foreground">
      <span>{label}</span>
      <div role="radiogroup" aria-label={label} className="flex items-center gap-2">
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
              className={cn(
                "group relative size-[22px] rounded-full opacity-55 transition duration-150 hover:scale-110 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-ring",
                active && "opacity-100 ring-2 ring-current ring-offset-2 ring-offset-background",
              )}
            >
              <span
                role="tooltip"
                className="pointer-events-none absolute bottom-[130%] left-1/2 -translate-x-1/2 whitespace-nowrap z-10 rounded-md border bg-card px-2 py-1 text-[11px] text-foreground shadow-md opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
              >
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
