import { UserRound } from "lucide-react";
import { PAGE_HEADER } from "./page-header.config";
import type { PageHeaderProps } from "./page-header.types";

export function PageHeader({ title, description, account, children }: PageHeaderProps) {
  return (
    <header className="flex shrink-0 flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <h1 id={PAGE_HEADER.headingId} tabIndex={-1} className={PAGE_HEADER.headingClass}>
            {title}
          </h1>
          {account && (
            <span className="inline-flex max-w-full items-center gap-1 truncate rounded-full border bg-card px-2 py-0.5 text-xs text-muted-foreground">
              <UserRound size={PAGE_HEADER.iconSize} className="shrink-0" aria-hidden />
              <span className="truncate">{PAGE_HEADER.accountChip(account)}</span>
            </span>
          )}
        </div>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </div>
      {children && (
        <div className="flex flex-wrap items-center gap-2 max-sm:w-full">{children}</div>
      )}
    </header>
  );
}
