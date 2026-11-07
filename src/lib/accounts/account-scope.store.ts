import { create } from "zustand";
import { SELECTED_ACCOUNT_STORAGE_KEY } from "./accounts.config";

type AccountSelectionState = {
  /** What the user last picked: a SteamID or `all`. Validated against live accounts before use. */
  readonly selected: string | undefined;
  readonly select: (scope: string) => void;
};

function loadSelected(): string | undefined {
  try {
    return localStorage.getItem(SELECTED_ACCOUNT_STORAGE_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

/** Kept apart from the settings store so adding it can't invalidate anyone's saved settings. */
export const useAccountSelection = create<AccountSelectionState>((set) => ({
  selected: loadSelected(),
  select: (scope) => {
    try {
      localStorage.setItem(SELECTED_ACCOUNT_STORAGE_KEY, scope);
    } catch {
      // Storage can be unavailable (private mode); the choice then lasts for the session.
    }
    set({ selected: scope });
  },
}));
