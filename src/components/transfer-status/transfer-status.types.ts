import type { AccountState } from "~/lib/storage/storage.types";

export type TransferBannerProps = {
  readonly account: AccountState;
  /** Prefixes the banner with the account's name; set when more than one account is tracked. */
  readonly named: boolean;
};

export type ConveyorProps = {
  readonly fromName: string;
  readonly toName: string;
  /** Items still waiting at the source dock. */
  readonly remaining: number;
  /** Items already at the destination dock. */
  readonly moved: number;
  /** A tile rides the belt while the transfer runs. */
  readonly moving: boolean;
};
