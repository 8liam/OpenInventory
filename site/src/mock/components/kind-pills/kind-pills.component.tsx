import { Skeleton } from "~/components/skeleton/skeleton.component";
import { Pill } from "~/components/pill/pill.component";
import { OPENING_KINDS } from "~/lib/cases/cases.config";
import { COPY } from "~/lib/copy/copy.config";
import { formatInteger } from "~/utils/format";
import type { KindPillsProps } from "./kind-pills.types";

/** Switches the whole page between cases, souvenirs, capsules, trade-ups and drops. */
export function KindPills({ selected, counts, onSelect }: KindPillsProps) {
  return (
    <div role="group" className="flex flex-wrap gap-1.5">
      {OPENING_KINDS.map((kind) => (
        <Pill
          key={kind}
          active={selected === kind}
          disabled={!counts}
          onClick={() => onSelect(kind)}
        >
          {COPY.cases.kinds[kind].pill}{" "}
          {counts ? (
            <span className="tabular opacity-100">{formatInteger(counts[kind])}</span>
          ) : (
            <Skeleton className="inline-block h-3.5 w-5 align-middle" />
          )}
        </Pill>
      ))}
    </div>
  );
}
