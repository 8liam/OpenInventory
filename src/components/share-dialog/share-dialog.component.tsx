import { useEffect, useRef, useState } from "react";
import { Button } from "~/components/button/button.component";
import { Select } from "~/components/select/select.component";
import { COPY } from "~/lib/copy/copy.config";
import { useSettings } from "~/lib/settings/settings.store";
import { createShareLink } from "~/lib/shares/share.client";
import { SHARE_EXPIRY_OPTIONS } from "~/lib/shares/share.config";
import type { ShareExpiry } from "~/lib/shares/share.types";
import { SHARE_DIALOG } from "./share-dialog.config";
import type { ShareDialogProps } from "./share-dialog.types";

/** Creates a read-only link. The link is shown once; only its hash is kept on the server. */
export function ShareDialog({ open, scope, scopeLabel, onCreated, onClose }: ShareDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const { currency, marketplace } = useSettings();
  const [hidePrices, setHidePrices] = useState(false);
  const [expiry, setExpiry] = useState<ShareExpiry>(SHARE_DIALOG.defaultExpiry);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string>();
  const [url, setUrl] = useState<string>();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  function reset() {
    setHidePrices(false);
    setExpiry(SHARE_DIALOG.defaultExpiry);
    setWorking(false);
    setError(undefined);
    setUrl(undefined);
    setCopied(false);
    onClose();
  }

  async function create() {
    setWorking(true);
    setError(undefined);
    try {
      const created = await createShareLink({ scope, hidePrices, expiry, currency, marketplace });
      setUrl(`${window.location.origin}${created.path}`);
      onCreated?.();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : COPY.shares.requestFailed);
    } finally {
      setWorking(false);
    }
  }

  async function copyLink(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      setError(COPY.shares.requestFailed);
    }
  }

  return (
    <dialog
      ref={dialog}
      className={SHARE_DIALOG.dialogClass}
      onClose={reset}
      onCancel={(event) => working && event.preventDefault()}
    >
      <div className={SHARE_DIALOG.bodyClass}>
        <h2 className="font-semibold">{COPY.shares.dialogTitle}</h2>
        <p className="text-sm text-muted-foreground">{COPY.shares.dialogScope(scopeLabel)}</p>
        {url === undefined ? (
          <>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={hidePrices}
                disabled={working}
                onChange={(event) => setHidePrices(event.target.checked)}
              />
              {COPY.shares.hidePricesLabel}
            </label>
            <div className="flex items-center justify-between gap-4 text-sm">
              {COPY.shares.expiresLabel}
              <Select
                value={expiry}
                ariaLabel={COPY.shares.expiresLabel}
                className={SHARE_DIALOG.selectWidth}
                options={SHARE_EXPIRY_OPTIONS.map((id) => ({
                  id,
                  label: COPY.shares.expiryOptions[id],
                }))}
                onChange={(id) => {
                  const next = SHARE_EXPIRY_OPTIONS.find((option) => option === id);
                  if (next) setExpiry(next);
                }}
              />
            </div>
          </>
        ) : (
          <>
            <p className="text-sm font-medium">{COPY.shares.linkLabel}</p>
            <div className="flex gap-2">
              <input
                readOnly
                aria-label={COPY.shares.linkLabel}
                value={url}
                onFocus={(event) => event.currentTarget.select()}
                className={SHARE_DIALOG.linkInputClass}
              />
              <Button onClick={() => void copyLink(url)}>
                {copied ? COPY.shares.copied : COPY.shares.copy}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">{COPY.shares.copyNotice}</p>
          </>
        )}
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          {url === undefined ? (
            <>
              <Button disabled={working} onClick={() => dialog.current?.close()}>
                {COPY.shares.cancel}
              </Button>
              <Button disabled={working} onClick={() => void create()}>
                {working ? COPY.shares.creating : COPY.shares.create}
              </Button>
            </>
          ) : (
            <Button onClick={() => dialog.current?.close()}>{COPY.shares.done}</Button>
          )}
        </div>
      </div>
    </dialog>
  );
}
