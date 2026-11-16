import { splitItemName } from "~/components/item-label/item-label.utils";
import { UNIT_CARD } from "~/components/unit-card/unit-card.config";
import { INVENTORY_MOCK, UNITS_MOCK } from "../../mock/data/inventory.mock";
import { bento } from "./bento.config";
import type { BentoItem, BentoMove, BentoUnit } from "./bento.types";

const CENTS = 100;
const sumCents = (values: readonly number[]): number =>
  Math.round(values.reduce((sum, value) => sum + value * CENTS, 0)) / CENTS;

/** Resolves a sample-account item by its market name. A typo here fails the build, not the page. */
export function sampleItem(name: string): BentoItem {
  // Filler items reuse market names at a few cents; the curated sample item is the priciest match.
  const found = INVENTORY_MOCK.filter((item) => item.marketHashName === name).sort(
    (a, b) => (b.price ?? 0) - (a.price ?? 0),
  )[0];
  if (!found || found.imageUrl === null || found.price === null) {
    throw new Error(`Bento sample item "${name}" is missing, unpriced or has no image.`);
  }
  const [weapon, skin] = splitItemName(found.name);
  return {
    name: found.name,
    weapon,
    skin,
    imageUrl: found.imageUrl,
    rarityColor: found.rarityColor,
    price: found.price,
  };
}

/** The same figures unit-card.component.tsx derives: summed value, and the four priciest items with an image. */
export function sampleUnit(id: string): BentoUnit {
  const unit = UNITS_MOCK.find((candidate) => candidate.id === id);
  if (!unit) throw new Error(`Bento sample unit "${id}" does not exist.`);
  const items = INVENTORY_MOCK.filter((item) => item.locationId === id);
  const preview = items
    .filter((item) => item.imageUrl !== null && item.price !== null)
    .sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
    .slice(0, UNIT_CARD.previewCount + 1)
    .map((item): BentoItem => {
      const [weapon, skin] = splitItemName(item.name);
      return {
        name: item.name,
        weapon,
        skin,
        imageUrl: item.imageUrl ?? "",
        rarityColor: item.rarityColor,
        price: item.price ?? 0,
      };
    });
  return {
    id,
    name: unit.name,
    itemCount: unit.itemCount,
    value: sumCents(items.map((item) => item.price ?? 0)),
    preview,
  };
}

/** The animated move: one item leaves a storage unit and lands in another, so the account totals never change. */
export function sampleMove(): BentoMove {
  const { capacity } = bento;
  const item = sampleItem(capacity.itemName);
  const from = sampleUnit(capacity.fromUnit);
  const to = sampleUnit(capacity.toUnit);
  // Slots 0-3 are the visible preview; slot 4 slides in once the moved item leaves the source.
  const [backfill] = from.preview.filter(
    (candidate, slot) => slot >= UNIT_CARD.previewCount && candidate.name !== item.name,
  );
  if (!backfill) throw new Error("Bento source unit needs a fifth previewable item.");
  return {
    item,
    from,
    to,
    backfill,
    fromAfter: { itemCount: from.itemCount - 1, value: sumCents([from.value, -item.price]) },
    toAfter: { itemCount: to.itemCount + 1, value: sumCents([to.value, item.price]) },
  };
}
