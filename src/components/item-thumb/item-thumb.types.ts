export type ItemThumbProps = {
  readonly imageUrl: string | null;
  readonly rarityColor: string | null;
  /** Omit the bottom marker when the surrounding card already shows a rarity key. */
  readonly showRarityBar?: boolean;
  /** Square side in px; leave out to size it from `className` (e.g. a card thumbnail). */
  readonly size?: number;
  readonly className?: string;
};
