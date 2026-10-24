export type RunningServer = {
  readonly url: string;
  stop: () => void;
};
