import { cn } from "~/utils/cn";
import { SETTINGS_NAV } from "./settings-nav.config";
import type { SettingsNavProps } from "./settings-nav.types";

/** The settings category rail; a horizontally scrollable tab row when the page is narrow. */
export function SettingsNav<T extends string>({
  items,
  value,
  onChange,
  ariaLabel,
}: SettingsNavProps<T>) {
  return (
    <nav aria-label={ariaLabel} className={SETTINGS_NAV.navClass}>
      {items.map(({ id, label, icon: Icon }) => {
        const active = id === value;
        return (
          <button
            key={id}
            type="button"
            aria-current={active ? "page" : undefined}
            onClick={() => onChange(id)}
            className={cn(SETTINGS_NAV.itemClass, active && SETTINGS_NAV.activeClass)}
          >
            <Icon size={SETTINGS_NAV.iconSize} aria-hidden />
            {label}
          </button>
        );
      })}
    </nav>
  );
}
