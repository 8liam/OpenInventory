import { createContext } from "react";
import type { SkinViewerConsent } from "./skin-viewer.types";

/**
 * Whether the user agreed to the third-party preview. The app provides it from its settings store;
 * without a provider (the landing site) there is nowhere to remember consent, so no button shows.
 */
export const SkinViewerConsentContext = createContext<SkinViewerConsent | null>(null);
