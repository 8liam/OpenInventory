import { formatFloat } from "../../utils/format.ts";
import { HIGHLIGHTS } from "./highlights.config.ts";
import type { ItemView } from "./item.types.ts";
import type { HighlightReason, ItemHighlights } from "./highlights.types.ts";

function attachmentReferenceUsd(name: string): number | null {
  const estimate = HIGHLIGHTS.attachmentEstimatesUsd.find((entry) =>
    name.toLocaleLowerCase().includes(entry.name.toLocaleLowerCase()),
  );
  return estimate?.value ?? null;
}

function gemPhaseLabel(item: ItemView): string | null {
  const match = HIGHLIGHTS.gemPhases.find(
    (phase) =>
      item.name.includes(phase.finish) &&
      (item.paintIndex === phase.paintIndex || item.name.includes(phase.label)),
  );
  return match?.label ?? null;
}

function patternLabel(item: ItemView): string | null {
  const gem = gemPhaseLabel(item);
  if (gem !== null) return gem;
  const seed = item.paintSeed;
  if (seed === null || seed === undefined) return null;
  const match = HIGHLIGHTS.patterns.find(
    (entry) =>
      item.name.includes(entry.finish) && (entry.seeds as readonly number[]).includes(seed),
  );
  return match ? `${match.label} #${seed}` : null;
}

function floatSignal(item: ItemView): boolean {
  const { wear, minWear, maxWear } = item;
  if (wear === null || minWear == null || maxWear == null || maxWear <= minWear) return false;
  const tail = (maxWear - minWear) * HIGHLIGHTS.floatTailFraction;
  return wear <= minWear + tail || wear >= maxWear - tail;
}

export function scoreItemHighlights(item: ItemView): ItemHighlights {
  const reasons: HighlightReason[] = [];
  let score = 0;
  if (item.wear !== null && floatSignal(item)) {
    score += HIGHLIGHTS.floatScore;
    reasons.push({
      kind: "float",
      label: `${HIGHLIGHTS.floatLabelPrefix} ${formatFloat(item.wear)}`,
    });
  }

  const pattern = patternLabel(item);
  if (pattern !== null) {
    score += HIGHLIGHTS.patternScore;
    reasons.push({ kind: "pattern", label: pattern });
  }

  const referenceValue = [...item.stickers, ...item.charms]
    .map(({ name }) => attachmentReferenceUsd(name))
    .reduce<number>((sum, value) => sum + (value ?? 0), 0);
  const estimatedPremiumUsd =
    referenceValue > 0 ? referenceValue * HIGHLIGHTS.attachmentPremiumFactor : null;
  if (estimatedPremiumUsd !== null) {
    score += HIGHLIGHTS.attachmentScore;
    reasons.push({ kind: "craft", label: HIGHLIGHTS.craftLabel });
  }

  const capped = Math.min(score, 100);
  const notable = capped >= HIGHLIGHTS.notableScore;
  return {
    score: capped,
    reasons: notable ? reasons : [],
    tier: capped >= HIGHLIGHTS.exceptionalScore ? "exceptional" : null,
    estimatedPremiumUsd,
  };
}
