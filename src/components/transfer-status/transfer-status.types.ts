import type { AccountState } from "~/lib/storage/storage.types";

export type TransferBannerProps = {
  readonly account: AccountState;
  /** Prefixes the banner with the account's name; set when more than one account is tracked. */
  readonly named: boolean;
};
