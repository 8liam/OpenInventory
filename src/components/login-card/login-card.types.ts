import type { AuthState } from "~/lib/storage/storage.types";

export type LoginCardProps = {
  /** The QR login in progress (signed-out when none is). */
  readonly login: AuthState;
  readonly title: string;
  readonly body: string;
  readonly buttonLabel: string;
};
