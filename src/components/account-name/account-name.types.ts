import type { AccountDisplayName } from "~/lib/accounts/accounts.types";

export type AccountNameProps = {
  readonly name: AccountDisplayName;
  readonly className?: string;
};
