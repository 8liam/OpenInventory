import { cn } from "~/utils/cn";
import type { PanelProps } from "./panel.types";

export function Panel({ title, action, children, className }: PanelProps) {
  return (
    <section className={cn("rounded-xl border bg-card", className)}>
      {title && (
        <header className="flex items-center justify-between gap-3 px-4 pt-3.5">
          <div className="text-[13px] font-medium">{title}</div>
          {action}
        </header>
      )}
      <div className={title ? "p-4 pt-3" : "p-4"}>{children}</div>
    </section>
  );
}
