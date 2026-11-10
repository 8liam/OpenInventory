import { cn } from "~/utils/cn";
import { useRadioGroup } from "~/utils/use-radio-group";
import { SEGMENTED_CONTROL } from "./segmented-control.config";
import type { SegmentedControlProps } from "./segmented-control.types";

/** A small set of mutually exclusive choices shown side by side; a radio group with arrow-key support. */
export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: SegmentedControlProps<T>) {
  const group = useRadioGroup(
    options.map((option) => option.id),
    value,
    onChange,
  );
  return (
    <div role="radiogroup" aria-label={ariaLabel} className={SEGMENTED_CONTROL.groupClass}>
      {options.map((option, index) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            ref={group.register(index)}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={group.tabIndexFor(index)}
            onClick={() => onChange(option.id)}
            onKeyDown={(event) => group.onKeyDown(event, index)}
            className={cn(SEGMENTED_CONTROL.buttonClass, active && SEGMENTED_CONTROL.activeClass)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
