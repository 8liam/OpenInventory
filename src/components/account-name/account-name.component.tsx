import { cn } from "~/utils/cn";
import { ACCOUNT_NAME } from "./account-name.config";
import type { AccountNameProps } from "./account-name.types";

/** An account's name, truncating when the spot is narrow. */
export function AccountName({ name, className }: AccountNameProps) {
  return <span className={cn(ACCOUNT_NAME.nameClass, className)}>{name}</span>;
}
