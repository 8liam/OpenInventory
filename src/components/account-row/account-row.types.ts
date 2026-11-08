import type { AccountState } from "~/lib/storage/storage.types";

export type AccountRowProps = {
  readonly account: AccountState;
  /** Called once the account is gone, so the list can move focus off the vanished row. */
  readonly onRemoved: () => void;
};
