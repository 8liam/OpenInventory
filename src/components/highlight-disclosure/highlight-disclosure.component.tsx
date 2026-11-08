import { useEffect, useId, useRef, useState, type SyntheticEvent } from "react";
import { createPortal } from "react-dom";
import { ItemTierBadge } from "~/components/item-highlights/item-highlights.component";
import { ITEM_HIGHLIGHTS } from "~/components/item-highlights/item-highlights.config";
import { COPY } from "~/lib/copy/copy.config";
import { itemHighlights } from "~/lib/items/highlights";
import { HIGHLIGHT_DISCLOSURE } from "./highlight-disclosure.config";
import type {
  HighlightDisclosurePlacement,
  HighlightDisclosureProps,
} from "./highlight-disclosure.types";

/** Right-aligns the panel to its trigger, below it or (when cramped) above, inside the viewport. */
function placementFor(trigger: HTMLElement): HighlightDisclosurePlacement {
  const rect = trigger.getBoundingClientRect();
  const { width: preferred, viewportMargin: margin, gap, minRoomBelow } = HIGHLIGHT_DISCLOSURE;
  const width = Math.min(preferred, window.innerWidth - margin * 2);
  const left = Math.min(Math.max(margin, rect.right - width), window.innerWidth - width - margin);
  const below = window.innerHeight - rect.bottom - gap - margin;
  const above = rect.top - gap - margin;
  return below < minRoomBelow && above > below
    ? { left, width, bottom: window.innerHeight - rect.top + gap, maxHeight: above }
    : { left, width, top: rect.bottom + gap, maxHeight: below };
}

/** Rows toggle selection on click; nothing inside the disclosure should reach them. */
const stop = (event: SyntheticEvent) => event.stopPropagation();

/**
 * The item's tier (or a highlight marker) as a button that opens every highlight reason with
 * its seed, exact float and attachments. The panel is portalled out of the virtualised row, so
 * focus moves into it on open and back to the button on Escape or Tab.
 */
export function HighlightDisclosure({ item, showCount = false }: HighlightDisclosureProps) {
  const { tier, reasons } = itemHighlights(item);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLElement>(null);
  const [placement, setPlacement] = useState<HighlightDisclosurePlacement>();
  const panelId = useId();
  const titleId = useId();
  const open = placement !== undefined;
  const copy = HIGHLIGHT_DISCLOSURE;

  useEffect(() => {
    if (!open) return;
    panel.current?.focus();
    const close = () => setPlacement(undefined);
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!panel.current?.contains(target) && !trigger.current?.contains(target)) close();
    };
    // The trigger scrolls with its row (or the page), which would leave the panel behind.
    const onScroll = (event: Event) => {
      if (!(event.target instanceof Node && panel.current?.contains(event.target))) close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  if (tier === null && reasons.length === 0) return null;

  function hide(refocus: boolean) {
    setPlacement(undefined);
    if (refocus) trigger.current?.focus();
  }

  const MarkerIcon = ITEM_HIGHLIGHTS.markerIcon;
  const CountIcon = copy.countIcon;
  const CloseIcon = copy.closeIcon;
  const attachments = [
    {
      label: copy.details.stickers,
      names: item.stickers.map((sticker) => sticker.name.replace(copy.stickerPrefix, "")),
    },
    {
      label: copy.details.charms,
      names: item.charms.map((charm) => charm.name.replace(copy.charmPrefix, "")),
    },
  ].filter(({ names }) => names.length > 0);

  return (
    <>
      <button
        ref={trigger}
        type="button"
        aria-label={copy.triggerLabel(item.name, reasons.length)}
        aria-expanded={open}
        aria-controls={panelId}
        title={reasons.map((reason) => reason.label).join(copy.listSeparator)}
        className={copy.triggerClass}
        onClick={(event) => {
          stop(event);
          if (open) hide(false);
          else if (trigger.current) setPlacement(placementFor(trigger.current));
        }}
      >
        {tier !== null ? (
          <ItemTierBadge item={item} decorative />
        ) : (
          <MarkerIcon size={ITEM_HIGHLIGHTS.markerIconSize} className="m-0.5" aria-hidden />
        )}
        {showCount && reasons.length > 0 && (
          <span className={copy.countClass} aria-hidden>
            <CountIcon size={copy.iconSize} />
            {reasons.length}
          </span>
        )}
      </button>
      {open &&
        createPortal(
          <section
            ref={panel}
            id={panelId}
            tabIndex={-1}
            aria-labelledby={titleId}
            style={placement}
            className={copy.panelClass}
            onClick={stop}
            onKeyDown={(event) => {
              stop(event);
              if (event.key === copy.keys.close) {
                event.preventDefault();
                hide(true);
              } else if (event.key === copy.keys.leave) {
                // Hand focus back to the button and let Tab carry on from there, in page order.
                hide(true);
              }
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 id={titleId} className="text-sm font-medium">
                  {item.name}
                </h2>
                {tier !== null && (
                  <p className="mt-0.5 text-muted-foreground">{COPY.items.tierDescription(tier)}</p>
                )}
              </div>
              <button
                type="button"
                aria-label={copy.close}
                className={copy.closeClass}
                onClick={() => hide(true)}
              >
                <CloseIcon size={copy.closeIconSize} aria-hidden />
              </button>
            </div>
            {reasons.length > 0 && (
              <div>
                <h3 className="font-medium text-muted-foreground">{copy.reasonsHeading}</h3>
                <ul className="mt-1 flex flex-col gap-1">
                  {reasons.map((reason) => {
                    const Icon = ITEM_HIGHLIGHTS.kindIcons[reason.kind];
                    return (
                      <li
                        key={`${reason.kind}-${reason.label}`}
                        className="flex items-center gap-1.5"
                      >
                        <Icon
                          size={copy.iconSize}
                          className="shrink-0 text-muted-foreground"
                          aria-hidden
                        />
                        {reason.label}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
              {item.paintSeed != null && (
                <>
                  <dt className="text-muted-foreground">{copy.details.seed}</dt>
                  <dd className="tabular">{copy.seedValue(item.paintSeed)}</dd>
                </>
              )}
              {item.wear !== null && (
                <>
                  <dt className="text-muted-foreground">{copy.details.float}</dt>
                  <dd className="tabular">{item.wear.toFixed(copy.floatDigits)}</dd>
                </>
              )}
              {attachments.map(({ label, names }) => (
                <div key={label} className="contents">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd>
                    <ul>
                      {names.map((name, index) => (
                        <li key={`${name}-${index}`}>{name}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              ))}
            </dl>
          </section>,
          document.body,
        )}
    </>
  );
}
