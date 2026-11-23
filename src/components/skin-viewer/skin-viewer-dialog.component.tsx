import { useEffect, useId, useRef, useState } from "react";
import { Button } from "~/components/button/button.component";
import { parseSkinViewerMessage } from "~/lib/skin-viewer/skin-viewer";
import { useSettings } from "~/lib/settings/settings.store";
import { cn } from "~/utils/cn";
import { SKIN_VIEWER } from "./skin-viewer.config";
import type { SkinViewerDialogProps, SkinViewerStatus } from "./skin-viewer.types";

const { classes, consent, frame } = SKIN_VIEWER;

/** Modal with the 3D preview. The iframe mounts only once the user has agreed to the third-party request. */
export default function SkinViewerDialog({ url, name, onClose }: SkinViewerDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const iframe = useRef<HTMLIFrameElement>(null);
  const titleId = useId();
  const [status, setStatus] = useState<SkinViewerStatus>("loading");
  const agreed = useSettings((s) => s.skinViewerConsent);
  const setAgreed = useSettings((s) => s.setSkinViewerConsent);

  useEffect(() => {
    const element = dialog.current;
    if (element && !element.open) element.showModal();
  }, []);

  useEffect(() => {
    if (!agreed) return;
    function onMessage(event: MessageEvent<unknown>) {
      const message = parseSkinViewerMessage(event, iframe.current?.contentWindow);
      if (message === null) return;
      if (message.kind === "loaded") setStatus("loaded");
      if (message.kind === "error") setStatus("error");
      if (message.kind === "escape") dialog.current?.close();
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [agreed]);

  return (
    <dialog
      ref={dialog}
      className={classes.dialog}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) dialog.current?.close();
      }}
    >
      <div className={classes.body}>
        <div className={classes.header}>
          <h2 id={titleId} className={classes.title}>
            {agreed ? name : consent.heading}
          </h2>
          <Button small variant="ghost" onClick={() => dialog.current?.close()}>
            {SKIN_VIEWER.closeLabel}
          </Button>
        </div>
        {agreed ? (
          <div className={classes.stage}>
            <iframe
              ref={iframe}
              src={url}
              title={`${SKIN_VIEWER.dialogTitle}: ${name}`}
              allow={frame.allow}
              referrerPolicy={frame.referrerPolicy}
              sandbox={frame.sandbox}
              className={cn(classes.frame, status === "error" && "invisible")}
            />
            {status !== "loaded" && (
              <p role="status" className={classes.status}>
                {status === "error" ? SKIN_VIEWER.errorLabel : SKIN_VIEWER.loadingLabel}
              </p>
            )}
          </div>
        ) : (
          <>
            <p className={classes.note}>{consent.body}</p>
            <div className={classes.actions}>
              <Button onClick={() => dialog.current?.close()}>{consent.cancelLabel}</Button>
              <Button variant="primary" onClick={() => setAgreed(true)}>
                {consent.confirmLabel}
              </Button>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}
