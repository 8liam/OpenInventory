import type { AuthState } from "~/lib/storage/storage.types";

export type LoginCardProps = {
  /** The QR login in progress (signed-out when none is). */
  readonly login: AuthState;
  readonly title: string;
  readonly body: string;
  readonly buttonLabel: string;
  /** Draws its own card; off inside a dialog, which is already the surface. */
  readonly framed?: boolean;
  /** Ids for the heading and body, so a surrounding dialog can name and describe itself by them. */
  readonly headingId?: string;
  readonly bodyId?: string;
  /** The first-run screen's card is the page's main heading; inside a dialog it sits under the page's. */
  readonly headingLevel?: 1 | 2;
};
