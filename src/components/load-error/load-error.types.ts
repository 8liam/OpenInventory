export type LoadErrorProps = {
  /** What failed; defaults to the page load. */
  readonly title?: string;
  /** Why the load failed, as the server or browser reported it. */
  readonly message: string;
  readonly onRetry: () => void;
  /** A retry is in flight: the button stays mounted and focusable, but presses are ignored. */
  readonly retrying?: boolean;
};
