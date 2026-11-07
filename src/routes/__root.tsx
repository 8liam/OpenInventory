import { createRootRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { AppShell } from "~/components/app-shell/app-shell.component";
import { SHARE_API } from "~/lib/shares/share.config";

/** Share pages are public, so they render without the app shell and its sign-in gate. */
function RootLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return pathname.startsWith(SHARE_API.pagePrefix) ? <Outlet /> : <AppShell />;
}

export const Route = createRootRoute({ component: RootLayout });
