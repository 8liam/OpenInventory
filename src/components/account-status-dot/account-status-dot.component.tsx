import { authStatusText } from "~/lib/accounts/account-status";
import { cn } from "~/utils/cn";
import { ACCOUNT_STATUS_DOT } from "./account-status-dot.config";
import type { AccountStatusDotProps } from "./account-status-dot.types";

/** A coloured dot for an account's connection, always paired with its status as text. */
export function AccountStatusDot({
  status,
  text,
  showText = false,
  decorative = false,
  className,
}: AccountStatusDotProps) {
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1.5", className)}>
      <span
        className={cn(ACCOUNT_STATUS_DOT.base, ACCOUNT_STATUS_DOT.classes[status])}
        aria-hidden
      />
      {!decorative && (
        <span className={showText ? "text-xs text-muted-foreground" : "sr-only"}>
          {text ?? authStatusText(status)}
        </span>
      )}
    </span>
  );
}
