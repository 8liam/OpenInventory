import type { ACCOUNT_LABELS } from "./accounts.config.ts";

export type AccountLabel = (typeof ACCOUNT_LABELS)[number];

/** A Steam account OpenInventory tracks. Its SteamID is the account id everywhere. */
export type Account = {
  readonly steamId: string;
  readonly label: AccountLabel | null;
  /** Epoch ms the account was first added. */
  readonly addedAt: number;
};
