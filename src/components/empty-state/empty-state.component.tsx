import { EMPTY_STATE } from "./empty-state.config";
import type { EmptyStateProps } from "./empty-state.types";

/** A section with nothing to show: a headline and a quieter reason, so empty never reads as broken. */
export function EmptyState({ icon: Icon, title, body }: EmptyStateProps) {
  return (
    <div className={EMPTY_STATE.rootClass}>
      <Icon size={EMPTY_STATE.iconSize} className={EMPTY_STATE.iconClass} aria-hidden />
      <div className="min-w-0">
        <p className={EMPTY_STATE.titleClass}>{title}</p>
        <p className={EMPTY_STATE.bodyClass}>{body}</p>
      </div>
    </div>
  );
}
