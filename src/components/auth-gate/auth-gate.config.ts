import { SNAPSHOT_CONNECTION } from "~/lib/storage/storage.config";
import type { ConnectionProblemProps } from "~/components/connection-problem/connection-problem.types";

/** First-load stream states that get a "can't reach the server" screen instead of a skeleton. */
export const AUTH_GATE = {
  problemStates: [
    SNAPSHOT_CONNECTION.disconnected,
    SNAPSHOT_CONNECTION.incompatible,
  ] as const satisfies readonly ConnectionProblemProps["reason"][],
} as const;
