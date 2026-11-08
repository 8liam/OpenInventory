export type RefreshAccounts = {
  /** Refreshes every connected account in view; accounts that aren't connected are skipped. */
  readonly refresh: () => Promise<void>;
  readonly busy: boolean;
  /** Which accounts failed and why, or undefined when the last refresh fully succeeded. */
  readonly error: string | undefined;
  /** False when no account in view is connected, so there is nothing to refresh. */
  readonly canRefresh: boolean;
  /** What a refresh covers, e.g. `All accounts` or `bossman (…0001)`. */
  readonly scopeLabel: string;
  /** How many accounts in view are left out because they aren't connected. */
  readonly skipped: number;
};
