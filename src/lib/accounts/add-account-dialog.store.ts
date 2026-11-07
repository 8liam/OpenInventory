import { create } from "zustand";

type AddAccountDialogState = {
  readonly open: boolean;
  readonly setOpen: (open: boolean) => void;
};

/** Lets the switcher, the settings page and the status panels open the one add-account dialog. */
export const useAddAccountDialog = create<AddAccountDialogState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));
