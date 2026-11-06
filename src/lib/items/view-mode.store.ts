import { create } from "zustand";
import { DEFAULT_VIEW_MODE, VIEW_MODE_STORAGE_KEY } from "./view-mode.config";
import { ITEM_VIEW_MODES, type ItemViewMode, type ItemViewModeState } from "./view-mode.types";

function loadMode(): ItemViewMode {
  try {
    const raw = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    return ITEM_VIEW_MODES.find((mode) => mode === raw) ?? DEFAULT_VIEW_MODE;
  } catch {
    return DEFAULT_VIEW_MODE;
  }
}

/** One choice shared by Items and Storage, remembered between visits. */
export const useItemViewMode = create<ItemViewModeState>((set) => ({
  mode: loadMode(),
  setMode: (mode) => {
    try {
      localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
    } catch {
      // Storage can be unavailable (private mode); the choice then lasts for the session.
    }
    set({ mode });
  },
}));
