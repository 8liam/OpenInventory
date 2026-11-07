import { AppShellSkeleton } from "~/components/app-shell-skeleton/app-shell-skeleton.component";
import { SignInScreen } from "~/components/sign-in-screen/sign-in-screen.component";
import { useAppSnapshot, useSnapshotReceived } from "~/lib/storage/storage.client";
import type { AuthGateProps } from "./auth-gate.types";

/** Everything inside needs at least one tracked Steam account; each account's own connection is handled further in. */
export function AuthGate({ children }: AuthGateProps) {
  const { accounts, login } = useAppSnapshot();
  const received = useSnapshotReceived();
  if (!received) return <AppShellSkeleton />;
  return accounts.length > 0 ? <>{children}</> : <SignInScreen login={login} />;
}
