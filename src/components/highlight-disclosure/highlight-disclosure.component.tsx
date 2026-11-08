import { useEffect, useId, useRef, useState, type KeyboardEvent, type SyntheticEvent } from "react";
import { createPortal, flushSync } from "react-dom";
import { ItemTierBadge } from "~/components/item-highlights/item-highlights.component";
import { ITEM_HIGHLIGHTS } from "~/components/item-highlights/item-highlights.config";
import { COPY } from "~/lib/copy/copy.config";
import { itemHighlights } from "~/lib/items/highlights";
import { HIGHLIGHT_DISCLOSURE } from "./highlight-disclosure.config";
import type {
  HighlightDisclosurePlacement,
  HighlightDisclosureProps,
} from "./highlight-disclosure.types";

/**
 * Right-aligns the panel to its trigger, below it or (when cramped) above, inside the viewport
 * horizontally and inside the page content (clear of the header and bottom nav) vertically.
 */
function placementFor(trigger: HTMLElement): HighlightDisclosurePlacement {
  const rect = trigger.getBoundingClientRect();
  const { width: preferred, viewportMargin: margin, gap, minRoomBelow } = HIGHLIGHT_DISCLOSURE;
  const bounds = trigger.closest(HIGHLIGHT_DISCLOSURE.boundsSelector)?.getBoundingClientRect();
  const floor = Math.min(bounds?.bottom ?? window.innerHeight, window.innerHeight);
  const ceiling = Math.max(bounds?.top ?? 0, 0);
  const width = Math.min(preferred, window.innerWidth - margin * 2);
  const left = Math.min(Math.max(margin, rect.right - width), window.innerWidth - width - margin);
  const below = floor - rect.bottom - gap - margin;
  const above = rect.top - ceiling - gap - margin;
  return below < minRoomBelow && above > below
    ? { left, width, bottom: window.innerHeight - rect.top + gap, maxHeight: above }
    : { left, width, top: rect.bottom + gap, maxHeight: below };
}

/** Rows toggle selection on click; nothing inside the disclosure should reach them. */
const stop = (event: SyntheticEvent) => event.stopPropagation();

/**
 * The item's tier (or a highlight marker) as a button that opens every highlight reason with
 * its seed, exact float and attachments. The panel is portalled out of the virtualised row but
 * behaves as if it sat right after the button: focus moves into it on open, Tab walks through
 * it, Tab past its end or Shift+Tab before its start returns to the button (and Tab carries on
 * from there), and Escape, Close or anything that closes it returns focus to the button.
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
    // Closing on scroll or resize must not strand focus in the panel as it unmounts.
    const close = () => {
      if (panel.current?.contains(document.activeElement))
        trigger.current?.focus({ preventScroll: true });
      setPlacement(undefined);
    };
    const inside = (target: EventTarget | null) =>
      target instanceof Node &&
      (panel.current?.contains(target) === true || trigger.current?.contains(target) === true);
    // A click elsewhere moves focus there itself, so focus is left alone.
    const onPointerDown = (event: PointerEvent) => {
      if (!inside(event.target)) setPlacement(undefined);
    };
    // The panel follows its trigger as the row (or the page) scrolls, including the scroll that
    // brings a half-hidden row into view on click, and closes once the trigger scrolls out of
    // the container that scrolled.
    const onScroll = (event: Event) => {
      const button = trigger.current;
      const { target } = event;
      if (!button || (target instanceof Node && panel.current?.contains(target))) return;
      const rect = button.getBoundingClientRect();
      const box =
        target instanceof Element && target.contains(button)
          ? target.getBoundingClientRect()
          : { top: 0, bottom: window.innerHeight };
      if (rect.bottom <= box.top || rect.top >= box.bottom) close();
      else setPlacement(placementFor(button));
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

  // The panel is unmounted before focus moves, so nothing that happens while it goes away
  // (a blur, the row re-rendering) can leave focus anywhere but the button.
  function hide(refocus: boolean) {
    flushSync(() => setPlacement(undefined));
    if (refocus) trigger.current?.focus();
  }

  function onPanelKeyDown(event: KeyboardEvent<HTMLElement>) {
    stop(event);
    if (event.key === copy.keys.close) {
      event.preventDefault();
      hide(true);
      return;
    }
    if (event.key !== copy.keys.tab || !panel.current) return;
    const stops = [
      panel.current,
      ...panel.current.querySelectorAll<HTMLElement>(copy.focusableSelector),
    ];
    const at = stops.findIndex((element) => element === document.activeElement);
    const next = at + (event.shiftKey ? -1 : 1);
    if (next >= stops.length) {
      // Past the end: back on the button, and the browser's own Tab carries on from there.
      hide(true);
      return;
    }
    event.preventDefault();
    if (next < 0) hide(true);
    else stops[next]?.focus();
  }

  const MarkerIcon = ITEM_HIGHLIGHTS.markerIcon;
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
        aria-label={copy.triggerLabel(
          tier === null ? null : `${ITEM_HIGHLIGHTS.tierPrefix}${tier.tier}`,
          item.name,
          reasons.length,
          showCount,
        )}
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
          <MarkerIcon
            size={ITEM_HIGHLIGHTS.markerIconSize}
            className={copy.markerClass}
            aria-hidden
          />
        )}
        {showCount && reasons.length > 0 && (
          <span className={copy.countClass} aria-hidden>
            +{reasons.length}
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
            onKeyDown={onPanelKeyDown}
          >
            <div className={copy.headClass}>
              <div className={copy.titleBlockClass}>
                <h2 id={titleId} className={copy.titleClass}>
                  {item.name}
                </h2>
                {tier !== null && <p className={copy.tierClass}>{COPY.items.tierRank(tier)}</p>}
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
                <h3 className={copy.reasonsHeadingClass}>{copy.reasonsHeading}</h3>
                <ul className={copy.reasonsClass}>
                  {reasons.map((reason) => {
                    const Icon = ITEM_HIGHLIGHTS.kindIcons[reason.kind];
                    return (
                      <li key={`${reason.kind}-${reason.label}`} className={copy.reasonClass}>
                        <Icon size={copy.iconSize} className={copy.reasonIconClass} aria-hidden />
                        {reason.label}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            <dl className={copy.detailsClass}>
              {item.paintSeed != null && (
                <>
                  <dt className={copy.termClass}>{copy.details.seed}</dt>
                  <dd className={copy.numberClass}>{copy.seedValue(item.paintSeed)}</dd>
                </>
              )}
              {item.wear !== null && (
                <>
                  <dt className={copy.termClass}>{copy.details.float}</dt>
                  <dd className={copy.numberClass}>{item.wear.toFixed(copy.floatDigits)}</dd>
                </>
              )}
              {attachments.map(({ label, names }) => (
                <div key={label} className={copy.attachmentClass}>
                  <dt className={copy.termClass}>{label}</dt>
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
