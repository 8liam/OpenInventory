import { useEffect, useState } from "react";
import { PageHeader } from "~/components/page-header/page-header.component";
import { COPY } from "~/lib/copy/copy.config";
import { formatRelativeTime } from "~/utils/format";
import { RELATIVE_TIME } from "~/utils/format.config";
import type { UpdatedHeaderProps } from "./updated-header.types";

/** Page header whose "updated N minutes ago" text ticks without re-rendering the page. */
export function UpdatedHeader({
  title,
  priceUpdatedAt,
  source,
  account,
  children,
}: UpdatedHeaderProps) {
  const [now, setNow] = useState(() => Date.now());
  const copy = COPY.dashboard;

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), RELATIVE_TIME.refreshMs);
    return () => clearInterval(timer);
  }, []);

  return (
    <PageHeader
      title={title}
      account={account}
      description={
        priceUpdatedAt
          ? copy.pricesUpdated(formatRelativeTime(priceUpdatedAt, now), source)
          : copy.pricesFrom(source)
      }
    >
      {children}
    </PageHeader>
  );
}
