import { SETTINGS_ROW } from "./settings-row.config";
import type { SettingsRowProps } from "./settings-row.types";

/** One setting: its name and a muted one-line description, with the control beside (or under) it. */
export function SettingsRow({
  label,
  description,
  detail,
  children,
  stacked = false,
  labelId,
}: SettingsRowProps) {
  return (
    <div className={stacked ? SETTINGS_ROW.stackedClass : SETTINGS_ROW.rowClass}>
      <div className={SETTINGS_ROW.textClass}>
        <div id={labelId} className={SETTINGS_ROW.labelClass}>
          {label}
        </div>
        {description && <p className={SETTINGS_ROW.descriptionClass}>{description}</p>}
        {detail}
      </div>
      {children && (
        <div className={stacked ? undefined : SETTINGS_ROW.controlClass}>{children}</div>
      )}
    </div>
  );
}
