import { UserRound } from "lucide-react";
import { PAGE_HEADER } from "./page-header.config";
import type { PageHeaderProps } from "./page-header.types";

const { classes } = PAGE_HEADER;

export function PageHeader({ title, description, account, children }: PageHeaderProps) {
  return (
    <header className={classes.root}>
      <div className={classes.titleBlock}>
        <div className={classes.titleRow}>
          <h1 id={PAGE_HEADER.headingId} tabIndex={-1} className={PAGE_HEADER.headingClass}>
            {title}
          </h1>
          {account && (
            <span className={classes.chip}>
              <UserRound size={PAGE_HEADER.iconSize} className={classes.chipIcon} aria-hidden />
              <span className={classes.chipText}>{PAGE_HEADER.accountChip(account)}</span>
            </span>
          )}
        </div>
        {description && <p className={classes.description}>{description}</p>}
      </div>
      {children && <div className={classes.actions}>{children}</div>}
    </header>
  );
}
