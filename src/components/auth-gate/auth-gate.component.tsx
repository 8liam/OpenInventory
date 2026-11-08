import { AppShellSkeleton } from "~/components/app-shell-skeleton/app-shell-skeleton.component";
import { ConnectionProblem } from "~/components/connection-problem/connection-problem.component";
import { SignInScreen } from "~/components/sign-in-screen/sign-in-screen.component";
import {
  useAppSnapshot,
  useSnapshotConnection,
  useSnapshotReceived,
} from "~/lib/storage/storage.client";
import { AUTH_GATE } from "./auth-gate.config";
import type { AuthGateProps } from "./auth-gate.types";

/** Everything inside needs at least one tracked Steam account; each account's own connection is handled further in. */
export function AuthGate({ children }: AuthGateProps) {
  const { accounts, login } = useAppSnapshot();
  const received = useSnapshotReceived();
  const connection = useSnapshotConnection();
  if (!received) {
    const problem = AUTH_GATE.problemStates.find((state) => state === connection);
    return problem ? <ConnectionProblem reason={problem} /> : <AppShellSkeleton />;
  }
  return accounts.length > 0 ? <>{children}</> : <SignInScreen login={login} />;
}
