import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Button } from "~/components/button/button.component";
import { parseSkinViewerMessage } from "~/lib/skin-viewer/skin-viewer";
import { cn } from "~/utils/cn";
import { SKIN_VIEWER } from "./skin-viewer.config";
import type { SkinViewerDialogProps, SkinViewerStatus } from "./skin-viewer.types";

const { classes, consent, frame } = SKIN_VIEWER;

/** Modal with the 3D preview. The iframe mounts only once the user has agreed to the third-party request. */
export default function SkinViewerDialog({
  url,
  name,
  consent: viewerConsent,
  onClose,
}: SkinViewerDialogProps) {
  const { agreed, setAgreed } = viewerConsent;
  const dialog = useRef<HTMLDialogElement>(null);
  const iframe = useRef<HTMLIFrameElement>(null);
  const titleId = useId();
  const [status, setStatus] = useState<SkinViewerStatus>("loading");
  const closeButton = useRef<HTMLButtonElement>(null);
  const askedForConsent = useRef(!agreed);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const element = dialog.current;
    if (element && !element.open) element.showModal();
  }, []);

  // The consent buttons vanish once the user agrees, so focus would fall back to the page behind.
  useEffect(() => {
    if (agreed && askedForConsent.current) closeButton.current?.focus();
  }, [agreed]);

  // A layout effect runs in the same commit that inserts the iframe, before the browser can deliver
  // any message to it, so none is missed. A blocked or silent embed times out into an error with a
  // Retry instead of an endless spinner.
  useLayoutEffect(() => {
    if (!agreed) return;
    function onMessage(event: MessageEvent<unknown>) {
      const message = parseSkinViewerMessage(event, iframe.current?.contentWindow);
      if (message === null) return;
      // Any sign of life means the embed is running and draws its own loading state.
      if (message.kind === "ready" || message.kind === "loading" || message.kind === "loaded") {
        setStatus("loaded");
      }
      if (message.kind === "error") setStatus("error");
      if (message.kind === "escape") dialog.current?.close();
    }
    window.addEventListener("message", onMessage);
    const timeout = window.setTimeout(
      () => setStatus((current) => (current === "loading" ? "error" : current)),
      SKIN_VIEWER.loadTimeoutMs,
    );
    return () => {
      window.removeEventListener("message", onMessage);
      window.clearTimeout(timeout);
    };
  }, [agreed, attempt]);

  function retry() {
    setStatus("loading");
    setAttempt((current) => current + 1);
  }

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
          <Button ref={closeButton} small variant="ghost" onClick={() => dialog.current?.close()}>
            {SKIN_VIEWER.closeLabel}
          </Button>
        </div>
        {agreed ? (
          <div className={classes.stage}>
            <iframe
              key={attempt}
              ref={iframe}
              src={url}
              title={`${SKIN_VIEWER.dialogTitle}: ${name}`}
              allow={frame.allow}
              referrerPolicy={frame.referrerPolicy}
              sandbox={frame.sandbox}
              className={cn(classes.frame, status === "error" && "invisible")}
            />
            {status !== "loaded" && (
              <div role="status" className={classes.status}>
                <p>{status === "error" ? SKIN_VIEWER.errorLabel : SKIN_VIEWER.loadingLabel}</p>
                {status === "error" && (
                  <Button small onClick={retry}>
                    {SKIN_VIEWER.retryLabel}
                  </Button>
                )}
              </div>
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
