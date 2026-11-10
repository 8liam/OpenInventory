import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/button/button.component";
import { DangerDialog } from "~/components/danger-dialog/danger-dialog.component";
import { SettingsRow } from "~/components/settings-row/settings-row.component";
import { SettingsSection } from "~/components/settings-section/settings-section.component";
import { useRefreshAccounts } from "~/lib/accounts/refresh-accounts.hooks";
import { COPY } from "~/lib/copy/copy.config";
import { useSettings } from "~/lib/settings/settings.store";
import { SETTINGS_PAGE } from "~/lib/settings/settings-page.config";

/** Settings > Data: refresh cached data and reset local preferences. */
export function SettingsData() {
  const refresh = useRefreshAccounts();
  const resetAll = useSettings((state) => state.resetAll);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const copy = COPY.settings.data;
  return (
    <>
      <SettingsSection title={copy.title}>
        <SettingsRow
          label={copy.refreshTitle}
          description={copy.refreshBody}
          detail={
            <>
              <p className={SETTINGS_PAGE.scopeClass}>{COPY.refresh.scope(refresh.scopeLabel)}</p>
              {refresh.skipped > 0 && (
                <p className={SETTINGS_PAGE.skippedClass}>
                  {COPY.refresh.skipped(refresh.skipped)}
                </p>
              )}
              {refresh.error && (
                <p role="alert" className={SETTINGS_PAGE.errorClass}>
                  {refresh.error}
                </p>
              )}
            </>
          }
        >
          <Button
            disabled={refresh.busy || !refresh.canRefresh}
            onClick={() => void refresh.refresh()}
          >
            <RefreshCw
              size={SETTINGS_PAGE.refreshIconSize}
              className={refresh.busy ? SETTINGS_PAGE.spinningClass : undefined}
              aria-hidden
            />
            {refresh.busy ? COPY.common.refreshing : copy.refreshData}
          </Button>
        </SettingsRow>
      </SettingsSection>
      <SettingsSection title={copy.resetTitle}>
        <SettingsRow label={copy.reset} description={copy.resetBody}>
          <Button variant="destructiveOutline" onClick={() => setConfirmingReset(true)}>
            {copy.resetButton}
          </Button>
        </SettingsRow>
      </SettingsSection>
      <DangerDialog
        open={confirmingReset}
        title={copy.resetDialogTitle}
        warning={copy.resetWarning}
        effects={copy.resetEffects}
        acknowledgement={copy.resetCheckbox}
        confirmLabel={copy.resetConfirm}
        workingLabel={copy.resetWorking}
        cancelLabel={copy.resetCancel}
        onConfirm={() => {
          resetAll();
          return Promise.resolve();
        }}
        onClose={() => setConfirmingReset(false)}
      />
    </>
  );
}
