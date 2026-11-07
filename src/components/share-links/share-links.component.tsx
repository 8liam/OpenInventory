import { useState } from "react";
import { Button } from "~/components/button/button.component";
import { Panel } from "~/components/panel/panel.component";
import { Select } from "~/components/select/select.component";
import { ShareDialog } from "~/components/share-dialog/share-dialog.component";
import { COPY } from "~/lib/copy/copy.config";
import { useStorageSnapshot } from "~/lib/storage/storage.client";
import { revokeShareLink } from "~/lib/shares/share.client";
import { useShareLinks } from "~/lib/shares/share.hooks";
import type { ShareScope } from "~/lib/shares/share.types";
import { isExpired, scopeLabel } from "~/lib/shares/share.utils";
import { formatDate } from "~/utils/format";
import { SHARE_LINKS } from "./share-links.config";

/** The owner's links: create one for everything or a unit, and revoke any of them. */
export function ShareLinksPanel() {
  const { state, reload } = useShareLinks();
  const { units } = useStorageSnapshot();
  const [now] = useState(() => Date.now());
  const [choice, setChoice] = useState<string>(SHARE_LINKS.allChoice);
  const [dialogScope, setDialogScope] = useState<ShareScope>({ kind: "all" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [revokingId, setRevokingId] = useState<string>();
  const [error, setError] = useState<string>();

  const loadedUnits = units.filter((u) => u.loaded);
  const options = [
    { id: SHARE_LINKS.allChoice, label: COPY.shares.scopeAll },
    ...loadedUnits.map((u) => ({ id: `${SHARE_LINKS.unitChoicePrefix}${u.id}`, label: u.name })),
  ];

  function openDialog() {
    const unitId = choice.startsWith(SHARE_LINKS.unitChoicePrefix)
      ? choice.slice(SHARE_LINKS.unitChoicePrefix.length)
      : undefined;
    setDialogScope(unitId === undefined ? { kind: "all" } : { kind: "unit", unitId });
    setDialogOpen(true);
  }

  async function revoke(id: string) {
    setRevokingId(id);
    setError(undefined);
    try {
      await revokeShareLink(id);
      reload();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : COPY.shares.requestFailed);
    } finally {
      setRevokingId(undefined);
    }
  }

  return (
    <>
      <Panel title={COPY.shares.title}>
        <p className="mb-3 text-muted-foreground">{COPY.shares.description}</p>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Select
            value={choice}
            ariaLabel={COPY.shares.scopeSelect}
            className={SHARE_LINKS.selectWidth}
            options={options}
            onChange={setChoice}
          />
          <Button onClick={openDialog}>{COPY.shares.newLink}</Button>
        </div>
        {error && (
          <p role="alert" className="mb-2 text-sm text-destructive">
            {error}
          </p>
        )}
        {state.status === "loading" && (
          <p className="text-muted-foreground">{COPY.shares.sharedLoading}</p>
        )}
        {state.status === "error" && (
          <p role="alert" className="text-destructive">
            {state.message}
          </p>
        )}
        {state.status === "ready" && state.links.length === 0 && (
          <p className="text-muted-foreground">{COPY.shares.empty}</p>
        )}
        {state.status === "ready" && state.links.length > 0 && (
          <ul className={SHARE_LINKS.listClass}>
            {state.links.map((link) => (
              <li key={link.id} className={SHARE_LINKS.rowClass}>
                <div className={SHARE_LINKS.textClass}>
                  <p className="truncate text-sm font-medium">{scopeLabel(link.scope, units)}</p>
                  <p className={SHARE_LINKS.metaClass}>
                    {[
                      COPY.shares.created(formatDate(link.createdAt)),
                      link.expiresAt === null
                        ? COPY.shares.neverExpires
                        : isExpired(link, now)
                          ? COPY.shares.expired
                          : COPY.shares.expiresOn(formatDate(link.expiresAt)),
                      link.hidePrices ? COPY.shares.hidePricesTag : undefined,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <Button
                  small
                  disabled={revokingId === link.id}
                  onClick={() => void revoke(link.id)}
                >
                  {revokingId === link.id ? COPY.shares.revoking : COPY.shares.revoke}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Panel>
      <ShareDialog
        open={dialogOpen}
        scope={dialogScope}
        scopeLabel={scopeLabel(dialogScope, units)}
        onCreated={reload}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
}
