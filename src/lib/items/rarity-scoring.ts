import { RARITY_SCORING } from "./rarity-scoring.config.ts";
import type { ItemView } from "./item.types.ts";
import type { ItemRarity, RarityBadge } from "./rarity-scoring.types.ts";

function attachmentReferenceUsd(name: string): number | null {
  const estimate = RARITY_SCORING.attachmentEstimatesUsd.find((entry) =>
    name.toLocaleLowerCase().includes(entry.name.toLocaleLowerCase()),
  );
  return estimate?.value ?? null;
}

function patternLabel(item: ItemView): string | null {
  const dopplerPhase = item.name.match(
    /(?:Gamma )?Doppler (Phase [1-4]|Ruby|Sapphire|Black Pearl)/,
  );
  if (dopplerPhase) return dopplerPhase[1] ?? null;
  if (item.paintSeed === null || item.paintSeed === undefined) return null;
  const match = RARITY_SCORING.patterns.find(
    (entry) =>
      item.name.includes(entry.finish) &&
      item.paintSeed !== null &&
      item.paintSeed !== undefined &&
      (entry.seeds as readonly number[]).includes(item.paintSeed),
  );
  return match && item.paintSeed !== null && item.paintSeed !== undefined
    ? `${match.label} #${item.paintSeed}`
    : null;
}

export function scoreItemRarity(item: ItemView): ItemRarity {
  const badges: RarityBadge[] = [];
  let score = 0;
  if (
    item.wear !== null &&
    item.minWear !== null &&
    item.minWear !== undefined &&
    item.maxWear !== null &&
    item.maxWear !== undefined &&
    item.maxWear > item.minWear
  ) {
    const tail = (item.maxWear - item.minWear) * RARITY_SCORING.floatTailFraction;
    if (item.wear <= item.minWear + tail) {
      score += RARITY_SCORING.floatScore;
      badges.push({ kind: "float", label: "Low float" });
    } else if (item.wear >= item.maxWear - tail) {
      score += RARITY_SCORING.floatScore;
      badges.push({ kind: "float", label: "High float" });
    }
  }

  const pattern = patternLabel(item);
  if (pattern !== null) {
    score += RARITY_SCORING.patternScore;
    badges.push({ kind: "pattern", label: pattern });
  }

  const attachmentValues = [
    ...item.stickers.map(({ name }) => name),
    ...item.charms.map(({ name }) => name),
  ]
    .map(attachmentReferenceUsd)
    .filter((value): value is number => value !== null);
  const referenceValue = attachmentValues.reduce((sum, value) => sum + value, 0);
  const estimatedPremiumUsd =
    referenceValue > 0 ? referenceValue * RARITY_SCORING.attachmentPremiumFactor : null;
  if (estimatedPremiumUsd !== null) {
    score += RARITY_SCORING.attachmentScore;
    badges.push({ kind: "attachments", label: "Valuable craft" });
  }

  return {
    score: Math.min(score, 100),
    badges: score >= RARITY_SCORING.notableScore ? badges : [],
    estimatedPremiumUsd,
  };
}
