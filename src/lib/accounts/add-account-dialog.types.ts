import type { LoginResult } from "~/lib/storage/storage.types";

/** A sign-in that finished from the dialog, kept so the app can say what happened after it closes. */
export type LoginOutcome = Pick<LoginResult, "steamId" | "added"> & {
  /** The account the dialog asked to sign in again, when it was a re-auth. */
  readonly target: string | undefined;
};

export type AddAccountDialogState = {
  readonly open: boolean;
  /** The account being signed in again; undefined when adding a new one. */
  readonly target: string | undefined;
  readonly outcome: LoginOutcome | undefined;
  readonly openAdd: () => void;
  readonly openReauth: (steamId: string) => void;
  readonly close: () => void;
  /** Closes the dialog and records how the sign-in ended. */
  readonly finish: (outcome: LoginOutcome) => void;
  readonly dismissOutcome: () => void;
};
