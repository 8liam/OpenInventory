import { AppShellSkeleton } from "~/components/app-shell-skeleton/app-shell-skeleton.component";
import { SignInScreen } from "~/components/sign-in-screen/sign-in-screen.component";
import { useSnapshotReceived, useStorageSnapshot } from "~/lib/storage/storage.client";
import { AUTH_STATUS } from "~/lib/storage/storage.config";
import type { AuthGateProps } from "./auth-gate.types";

/** Everything inside requires a connected Steam account. */
export function AuthGate({ children }: AuthGateProps) {
  const { auth } = useStorageSnapshot();
  const received = useSnapshotReceived();
  if (!received) return <AppShellSkeleton />;
  return auth.status === AUTH_STATUS.ready ? <>{children}</> : <SignInScreen auth={auth} />;
}
