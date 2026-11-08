import { LayoutGrid, List, type LucideIcon } from "lucide-react";
import type { ItemViewMode } from "~/lib/items/view-mode.types";
import { cn } from "~/utils/cn";
import { VIEW_TOGGLE } from "./view-toggle.config";
import type { ViewToggleProps } from "./view-toggle.types";

const ICONS = { list: List, grid: LayoutGrid } satisfies Record<ItemViewMode, LucideIcon>;

/** Same segmented control as the dashboard breakdown tabs, icon-only so it fits the page header. */
export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div role="group" aria-label={VIEW_TOGGLE.groupLabel} className={VIEW_TOGGLE.groupClass}>
      {VIEW_TOGGLE.options.map((option) => {
        const Icon = ICONS[option.id];
        const active = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={active}
            aria-label={option.label}
            title={option.label}
            onClick={() => onChange(option.id)}
            className={cn(VIEW_TOGGLE.buttonClass, active && VIEW_TOGGLE.activeClass)}
          >
            <Icon size={VIEW_TOGGLE.iconSize} aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
