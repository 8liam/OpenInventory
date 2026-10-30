import type { PageHeaderProps } from "./page-header.types";

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <header className="flex shrink-0 flex-wrap items-end justify-between gap-3">
      <div>
        <div className="text-lg font-semibold tracking-tight">{title}</div>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </header>
  );
}
