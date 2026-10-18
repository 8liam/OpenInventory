import { createRootRoute } from "@tanstack/react-router";
import { AppShell } from "~/components/app-shell/app-shell.component";

export const Route = createRootRoute({ component: AppShell });
