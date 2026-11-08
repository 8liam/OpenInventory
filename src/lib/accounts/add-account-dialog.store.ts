import { create } from "zustand";
import type { AddAccountDialogState } from "./add-account-dialog.types";

/** Lets the switcher, the settings page and the status panels open the one sign-in dialog. */
export const useAddAccountDialog = create<AddAccountDialogState>((set) => ({
  open: false,
  target: undefined,
  outcome: undefined,
  openAdd: () => set({ open: true, target: undefined, outcome: undefined }),
  openReauth: (steamId) => set({ open: true, target: steamId, outcome: undefined }),
  close: () => set({ open: false }),
  finish: (outcome) => set({ open: false, outcome }),
  dismissOutcome: () => set({ outcome: undefined }),
}));
