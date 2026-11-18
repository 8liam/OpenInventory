import type { FeatureDemoProps } from "./feature-demo.types";
import { useEffect, useRef, useState } from "react";
import {
  DEMO_HEIGHT,
  DEMO_MIN_SCALE,
  DEMO_VISIBLE_WIDTH,
  DEMO_WIDTH,
  FEATURE_DEMO_LABELS,
  FEATURE_DEMO_VARIANT,
} from "./feature-demo.config";

/**
 * One real OpenInventory page, live on the sample account, laid out at desktop size and scaled
 * down into a cropped panel so it reads like a screenshot but still responds to clicks.
 */
export default function FeatureDemo({ id, Demo }: FeatureDemoProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openRef = useRef<HTMLButtonElement>(null);
  const [scale, setScale] = useState(DEMO_MIN_SCALE);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const fit = () => setScale(Math.max(DEMO_MIN_SCALE, el.clientWidth / DEMO_VISIBLE_WIDTH));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!expanded || !dialog) return;
    dialog.showModal();
    // Safari lacks `closedby`: light-dismiss by hand when a click lands on the backdrop.
    if ('closedBy' in HTMLDialogElement.prototype) return;
    const onBackdropClick = (event: MouseEvent) => {
      if (event.target === dialog) dialog.close();
    };
    dialog.addEventListener('click', onBackdropClick);
    return () => dialog.removeEventListener('click', onBackdropClick);
  }, [expanded]);

  if (!Demo) return null;
  return (
    <div className="fdemo" ref={boxRef} style={{ minHeight: DEMO_HEIGHT * scale }}>
      <div
        className="fdemo__inner"
        style={{ width: DEMO_WIDTH, height: DEMO_HEIGHT, transform: `scale(${scale})` }}
      >
        <Demo variant={FEATURE_DEMO_VARIANT.inline} />
      </div>
      <button ref={openRef} type="button" className="fdemo__open" onClick={() => setExpanded(true)}>
        {FEATURE_DEMO_LABELS.open(id)}
      </button>
      {expanded && (
        <dialog
          ref={dialogRef}
          className="fdemo__dialog"
          closedby="any"
          data-lenis-prevent
          aria-label={FEATURE_DEMO_LABELS.dialog(id)}
          onClose={() => {
            setExpanded(false);
            openRef.current?.focus();
          }}
        >
          <div className="fdemo__dialog-head">
            <span>{FEATURE_DEMO_LABELS.dialogTitle(id)}</span>
            <button type="button" onClick={() => dialogRef.current?.close()}>
              {FEATURE_DEMO_LABELS.close}
            </button>
          </div>
          <div className="fdemo__dialog-body" data-lenis-prevent>
            <Demo variant={FEATURE_DEMO_VARIANT.dialog} />
          </div>
        </dialog>
      )}
    </div>
  );
}
