import type { SNAPSHOT_CONNECTION } from "~/lib/storage/storage.config";

export type ConnectionProblemProps = {
  readonly reason:
    | typeof SNAPSHOT_CONNECTION.disconnected
    | typeof SNAPSHOT_CONNECTION.incompatible;
};
