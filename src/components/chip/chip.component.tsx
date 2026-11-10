import { X } from "lucide-react";
import { cn } from "~/utils/cn";
import { CHIP } from "./chip.config";
import type { ChipProps } from "./chip.types";

const { classes } = CHIP;

/**
 * A small label: optional icon, text, a colour tone, and optionally an action (click the chip) or a
 * remove button. The one chip look shared by float, pattern, note, highlight and "+N" labels.
 */
export function Chip({
  children,
  icon: Icon,
  tone = CHIP.defaultTone,
  title,
  className,
  ariaLabel,
  onClick,
  onRemove,
  removeLabel,
  removing = false,
}: ChipProps) {
  const content = (
    <>
      {Icon && <Icon size={CHIP.iconSize} className={classes.icon} aria-hidden />}
      <span className={classes.text}>{children}</span>
    </>
  );
  const style = cn(classes.base, CHIP.tones[tone], className);

  if (onClick) {
    return (
      <button
        type="button"
        title={title}
        aria-label={ariaLabel}
        onClick={onClick}
        className={cn(style, classes.interactive)}
      >
        {content}
      </button>
    );
  }
  return (
    <span title={title} className={style}>
      {content}
      {onRemove && (
        <button
          type="button"
          aria-label={removeLabel}
          title={removeLabel}
          disabled={removing}
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
          className={classes.removeButton}
        >
          <X size={CHIP.removeIconSize} aria-hidden />
        </button>
      )}
    </span>
  );
}
