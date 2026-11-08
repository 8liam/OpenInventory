import { createRootRoute } from "@tanstack/react-router";
import { AppShell } from "~/components/app-shell/app-shell.component";
import { RootError } from "~/components/root-error/root-error.component";

export const Route = createRootRoute({
  component: AppShell,
  errorComponent: ({ error }) => <RootError error={error} />,
});
