import { useState } from "react";
import { Lock } from "lucide-react";
import { daysUntilUnlock } from "~/lib/items/tradability";
import { TRADE_LOCK_BADGE } from "./trade-lock-badge.config";

export function TradeLockBadge({ tradableAfter }: { readonly tradableAfter: number }) {
  const [now] = useState(() => Date.now());
  if (tradableAfter <= now) return null;
  return (
    <span
      className="inline-flex items-center gap-1 rounded bg-background/90 px-1.5 py-0.5 text-[10px] text-warning"
      title={new Date(tradableAfter).toLocaleString()}
    >
      <>
        <Lock size={11} aria-hidden />
        {TRADE_LOCK_BADGE.label(daysUntilUnlock(tradableAfter, now))}
      </>
    </span>
  );
}
