import { cn } from "~/utils/cn";
import { PANEL } from "./panel.config";
import type { PanelProps } from "./panel.types";

const { classes } = PANEL;

export function Panel({ title, action, children, className }: PanelProps) {
  return (
    <section className={cn(classes.root, className)}>
      {title && (
        <header className={classes.header}>
          <h2 className={classes.title}>{title}</h2>
          {action}
        </header>
      )}
      <div className={title ? classes.bodyWithTitle : classes.body}>{children}</div>
    </section>
  );
}
