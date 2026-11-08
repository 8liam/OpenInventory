/** What the banner says: why the screen may be out of date, and since when. */
export type StaleSummary = {
  readonly message: string;
  /** When the oldest data on screen arrived (epoch ms), or null when unknown. */
  readonly since: number | null;
};
