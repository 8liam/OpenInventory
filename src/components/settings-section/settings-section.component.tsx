import { useId } from "react";
import { SETTINGS_SECTION } from "./settings-section.config";
import type { SettingsSectionProps } from "./settings-section.types";

/** A titled card of settings rows separated by hairlines. */
export function SettingsSection({ title, description, action, children }: SettingsSectionProps) {
  const titleId = useId();
  return (
    <section aria-labelledby={titleId} className={SETTINGS_SECTION.rootClass}>
      <header className={SETTINGS_SECTION.headerClass}>
        <div>
          <h2 id={titleId} className={SETTINGS_SECTION.titleClass}>
            {title}
          </h2>
          {description && <p className={SETTINGS_SECTION.descriptionClass}>{description}</p>}
        </div>
        {action}
      </header>
      <div className={SETTINGS_SECTION.cardClass}>{children}</div>
    </section>
  );
}
