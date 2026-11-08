import { Sparkle, X } from "lucide-react";

export const HIGHLIGHT_DISCLOSURE = {
  /** Panel width in px, narrowed to fit the viewport on phones. */
  width: 288,
  viewportMargin: 8,
  gap: 6,
  /** Below this much room under the trigger (px), the panel opens upwards when there is more above. */
  minRoomBelow: 220,
  keys: { close: "Escape", leave: "Tab" },
  countIcon: Sparkle,
  closeIcon: X,
  iconSize: 12,
  closeIconSize: 14,
  /** Digits shown for the exact float in the panel; the table rounds to four. */
  floatDigits: 9,
  triggerLabel: (name: string, count: number) =>
    `Highlights for ${name}: ${count} ${count === 1 ? "reason" : "reasons"}`,
  close: "Close highlights",
  reasonsHeading: "Why it stands out",
  details: { seed: "Pattern seed", float: "Float", stickers: "Stickers", charms: "Charms" },
  seedValue: (seed: number) => `#${seed}`,
  /** The row already says what kind of attachment each list holds, so the name's prefix is dropped. */
  stickerPrefix: "Sticker | ",
  charmPrefix: "Charm | ",
  listSeparator: ", ",
  triggerClass:
    "inline-flex shrink-0 items-center gap-1 rounded-md p-0.5 text-muted-foreground outline-offset-1 hover:bg-muted aria-expanded:bg-muted max-md:min-h-7",
  countClass:
    "tabular inline-flex items-center gap-0.5 rounded bg-foreground/[0.07] px-1.5 py-px text-[11px] leading-4 text-foreground/80",
  panelClass:
    "fixed z-50 flex flex-col gap-2 overflow-y-auto rounded-md border bg-card p-3 text-xs text-foreground shadow-lg outline-none",
  closeClass:
    "-mr-1 -mt-1 flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground",
} as const;
