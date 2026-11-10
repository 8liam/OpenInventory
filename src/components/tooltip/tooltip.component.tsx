import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { TOOLTIP } from "./tooltip.config";
import type { TooltipPlacement, TooltipProps } from "./tooltip.types";
import { placeTooltip, splitName } from "./tooltip.utils";

/**
 * Names a sticker, charm or patch icon on hover and keyboard focus. The bubble is portalled and
 * fixed, so card and row overflow can't clip it, and Escape, scrolling or leaving dismisses it.
 */
export function Tooltip({ name, imageUrl, detail, children }: TooltipProps) {
  const id = useId();
  const trigger = useRef<HTMLSpanElement>(null);
  const timer = useRef<number>(undefined);
  const [placement, setPlacement] = useState<TooltipPlacement>();
  const open = placement !== undefined;
  const { kind, title } = splitName(name);

  function show() {
    if (!trigger.current) return;
    setPlacement(
      placeTooltip(trigger.current.getBoundingClientRect(), {
        width: window.innerWidth,
        height: window.innerHeight,
      }),
    );
  }

  function hide() {
    window.clearTimeout(timer.current);
    setPlacement(undefined);
  }

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === TOOLTIP.closeKey) hide();
    };
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", hide, true);
    window.addEventListener("resize", hide);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", hide, true);
      window.removeEventListener("resize", hide);
    };
  }, [open]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <>
      <span
        ref={trigger}
        tabIndex={0}
        aria-describedby={open ? id : undefined}
        className={TOOLTIP.triggerClass}
        onMouseEnter={() => {
          window.clearTimeout(timer.current);
          timer.current = window.setTimeout(show, TOOLTIP.showDelayMs);
        }}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        {children}
      </span>
      {open &&
        createPortal(
          <div
            id={id}
            role="tooltip"
            style={{
              left: placement.left,
              top: placement.top,
              bottom: placement.bottom,
              maxWidth: TOOLTIP.maxWidth,
            }}
            className={TOOLTIP.bubbleClass}
          >
            {imageUrl && (
              <img
                src={imageUrl}
                alt=""
                width={TOOLTIP.imageSize}
                height={TOOLTIP.imageSize}
                className={TOOLTIP.imageClass}
              />
            )}
            <div className={TOOLTIP.textClass}>
              {kind && <p className={TOOLTIP.kindClass}>{kind}</p>}
              <p className={TOOLTIP.titleClass}>{title}</p>
              {detail && <p className={TOOLTIP.detailClass}>{detail}</p>}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
