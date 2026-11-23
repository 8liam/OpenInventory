import { useMemo, type ReactNode } from "react";
import { useSettings } from "~/lib/settings/settings.store";
import { SkinViewerConsentContext } from "./skin-viewer-consent.context";

/** App-side bridge from the settings store to the skin viewer. Kept out of the shared viewer so the site never imports the store. */
export function SkinViewerConsentProvider({ children }: { readonly children: ReactNode }) {
  const agreed = useSettings((s) => s.skinViewerConsent);
  const setAgreed = useSettings((s) => s.setSkinViewerConsent);
  const value = useMemo(() => ({ agreed, setAgreed }), [agreed, setAgreed]);
  return <SkinViewerConsentContext value={value}>{children}</SkinViewerConsentContext>;
}
