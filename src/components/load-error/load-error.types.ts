export type LoadErrorProps = {
  /** Why the load failed, as the server or browser reported it. */
  readonly message: string;
  readonly onRetry: () => void;
};
