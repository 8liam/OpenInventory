import { cn } from "~/utils/cn";
import type { PanelProps } from "./panel.types";

export function Panel({ title, action, children, className }: PanelProps) {
  return (
    <section className={cn("rounded-lg border bg-card", className)}>
      {title && (
        <header className="flex items-center justify-between gap-3 border-b px-4 py-2.5">
          <h2 className="text-[13px] font-medium">{title}</h2>
          {action}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}
