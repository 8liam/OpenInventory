import { cn } from "~/utils/cn";
import { ACCOUNT_NAME } from "./account-name.config";
import type { AccountNameProps } from "./account-name.types";

/** An account's name, truncating, followed by its SteamID tail, which always stays visible. */
export function AccountName({ name, className }: AccountNameProps) {
  return (
    <span className={cn(ACCOUNT_NAME.rootClass, className)}>
      <span className={ACCOUNT_NAME.nameClass}>{name.name}</span>
      {name.suffix !== null && <span className={ACCOUNT_NAME.suffixClass}>{name.suffix}</span>}
    </span>
  );
}
