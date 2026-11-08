import { X } from "lucide-react";

export const HIGHLIGHT_DISCLOSURE = {
  /** Panel width in px, narrowed to fit the viewport on phones. */
  width: 288,
  viewportMargin: 8,
  gap: 6,
  /** Below this much room under the trigger (px), the panel opens upwards when there is more above. */
  minRoomBelow: 220,
  /**
   * The panel stays inside this element's box (the page content), so on phones it never covers
   * the header or the bottom navigation.
   */
  boundsSelector: "main",
  keys: { close: "Escape", tab: "Tab" },
  /** What the panel can move focus between, in order; the panel itself comes first. */
  focusableSelector: "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
  closeIcon: X,
  iconSize: 12,
  closeIconSize: 14,
  /** Digits shown for the exact float in the panel; the table rounds to four. */
  floatDigits: 9,
  /** Starts with the badge's visible text (e.g. "T2"), so the spoken name matches what's shown. */
  triggerLabel: (visibleTier: string | null, name: string, count: number, showCount: boolean) => {
    const visible = `${visibleTier ?? ""}${showCount && count > 0 ? `+${count}` : ""}`;
    return `${visible ? `${visible} highlights` : "Highlights"} for ${name}: ${count} ${count === 1 ? "reason" : "reasons"}`;
  },
  close: "Close highlights",
  reasonsHeading: "Why it stands out",
  details: { seed: "Pattern seed", float: "Float", stickers: "Stickers", charms: "Charms" },
  seedValue: (seed: number) => `#${seed}`,
  /** The row already says what kind of attachment each list holds, so the name's prefix is dropped. */
  stickerPrefix: "Sticker | ",
  charmPrefix: "Charm | ",
  listSeparator: ", ",
  /**
   * Touch screens and phones (the table's touch rule) get a 36px button, and an invisible
   * overhang stretches its tap area to 44px without growing the row; desktop stays compact.
   */
  triggerClass:
    "relative inline-flex shrink-0 items-center justify-center gap-1 rounded-md p-0.5 text-muted-foreground outline-offset-1 hover:bg-muted aria-expanded:bg-muted max-sm:min-h-9 max-sm:min-w-9 pointer-coarse:min-h-9 pointer-coarse:min-w-9 max-sm:before:absolute max-sm:before:-inset-1 pointer-coarse:before:absolute pointer-coarse:before:-inset-1 max-sm:before:content-[''] pointer-coarse:before:content-['']",
  markerClass: "m-0.5",
  countClass:
    "tabular inline-flex items-center gap-0.5 rounded bg-foreground/[0.07] px-1.5 py-px text-[11px] leading-4 text-foreground/80",
  panelClass:
    "fixed z-50 flex flex-col gap-2 overflow-y-auto rounded-md border bg-card p-3 text-xs text-foreground shadow-lg outline-none",
  closeClass:
    "-mr-1 -mt-1 flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground max-sm:size-9 pointer-coarse:size-9",
  headClass: "flex items-start justify-between gap-2",
  titleBlockClass: "min-w-0",
  titleClass: "text-sm font-medium",
  tierClass: "mt-0.5 text-muted-foreground",
  reasonsHeadingClass: "font-medium text-muted-foreground",
  reasonsClass: "mt-1 flex flex-col gap-1",
  reasonClass: "flex items-center gap-1.5",
  reasonIconClass: "shrink-0 text-muted-foreground",
  detailsClass: "grid grid-cols-[auto_1fr] gap-x-3 gap-y-1",
  termClass: "text-muted-foreground",
  numberClass: "tabular",
  attachmentClass: "contents",
} as const;
