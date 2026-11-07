import { useCallback, useEffect, useState } from "react";
import { COPY } from "../copy/copy.config.ts";
import { fetchSharedInventory, listShareLinks, sharedFailureMessage } from "./share.client.ts";
import type { ShareLinkSummary, SharedInventory } from "./share.types.ts";

export type ShareLinksState =
  | { readonly status: "loading" }
  | { readonly status: "ready"; readonly links: readonly ShareLinkSummary[] }
  | { readonly status: "error"; readonly message: string };

/** The owner's links, with a `reload` to call after creating or revoking one. */
export function useShareLinks(): { readonly state: ShareLinksState; readonly reload: () => void } {
  const [state, setState] = useState<ShareLinksState>({ status: "loading" });
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let current = true;
    listShareLinks().then(
      ({ links }) => {
        if (current) setState({ status: "ready", links });
      },
      (error: unknown) => {
        if (current) {
          setState({
            status: "error",
            message: error instanceof Error ? error.message : COPY.shares.requestFailed,
          });
        }
      },
    );
    return () => {
      current = false;
    };
  }, [version]);
  const reload = useCallback(() => setVersion((v) => v + 1), []);
  return { state, reload };
}

export type SharedInventoryState =
  | { readonly status: "loading" }
  | { readonly status: "ready"; readonly data: SharedInventory }
  | { readonly status: "error"; readonly message: string };

type SharedLoad = { readonly token: string; readonly state: SharedInventoryState };

/** Loads a public share with no session. Only the token is sent. */
export function useSharedInventory(token: string): SharedInventoryState {
  const [load, setLoad] = useState<SharedLoad>();
  useEffect(() => {
    const controller = new AbortController();
    fetchSharedInventory(token, controller.signal).then(
      (data) => setLoad({ token, state: { status: "ready", data } }),
      (error: unknown) => {
        if (!controller.signal.aborted) {
          setLoad({ token, state: { status: "error", message: sharedFailureMessage(error) } });
        }
      },
    );
    return () => controller.abort();
  }, [token]);
  // A load for another token is stale, so this token shows loading until its own answer arrives.
  return load?.token === token ? load.state : { status: "loading" };
}
