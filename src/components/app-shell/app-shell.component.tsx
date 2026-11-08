import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  ArrowLeftRight,
  Boxes,
  Laptop,
  LayoutDashboard,
  Package,
  PackageOpen,
  Settings,
} from "lucide-react";
import type { ComponentType } from "react";
import { AccountGate } from "~/components/account-gate/account-gate.component";
import { AccountSwitcher } from "~/components/account-switcher/account-switcher.component";
import { AddAccountDialog } from "~/components/add-account-dialog/add-account-dialog.component";
import { AuthGate } from "~/components/auth-gate/auth-gate.component";
import { InventoryPrefetch } from "~/components/inventory-prefetch/inventory-prefetch.component";
import { LoginOutcome } from "~/components/login-outcome/login-outcome.component";
import { Logo } from "~/components/logo/logo.component";
import { StaleBanner } from "~/components/stale-banner/stale-banner.component";
import { SyncError } from "~/components/sync-error/sync-error.component";
import { TransferStatus } from "~/components/transfer-status/transfer-status.component";
import { COPY } from "~/lib/copy/copy.config";
import { APP_SHELL, NAV_ITEMS } from "./app-shell.config";

const ICONS: Record<
  (typeof NAV_ITEMS)[number]["icon"],
  ComponentType<{ size?: number; strokeWidth?: number }>
> = {
  dashboard: LayoutDashboard,
  items: Boxes,
  storage: Package,
  cases: PackageOpen,
  terminals: Laptop,
  tradeup: ArrowLeftRight,
  settings: Settings,
};

export function AppShell() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return (
    <AuthGate>
      <InventoryPrefetch />
      <AddAccountDialog />
      <div
        aria-hidden
        className="fixed inset-x-0 top-0 z-50 hidden h-6 [-webkit-app-region:drag] desktop-mac:block"
      />
      <a
        href={`#${APP_SHELL.mainId}`}
        className={APP_SHELL.skipLinkClass}
        onClick={(event) => {
          event.preventDefault();
          document.getElementById(APP_SHELL.mainId)?.focus();
        }}
      >
        {APP_SHELL.skipLink}
      </a>
      <div className="flex h-dvh flex-col md:flex-row">
        <aside className="hidden w-56 shrink-0 flex-col border-r md:flex">
          <div className="px-4 py-4 desktop-mac:pt-12">
            <Logo />
          </div>
          <nav className="flex flex-1 flex-col gap-2 px-2">
            {NAV_ITEMS.map(({ to, key, icon }) => {
              const Icon = ICONS[icon];
              return (
                <Link
                  key={to}
                  to={to}
                  preload="intent"
                  activeOptions={{ exact: to === "/" }}
                  className="flex h-8 items-center gap-2.5 rounded-md px-2.5 text-muted-foreground transition-none data-[status=active]:transition-colors data-[status=active]:duration-200 data-[status=active]:ease-out not-data-[status=active]:hover:bg-muted not-data-[status=active]:hover:text-foreground data-[status=active]:bg-accent data-[status=active]:text-accent-foreground"
                >
                  <Icon size={15} strokeWidth={1.75} />
                  {COPY.nav[key]}
                </Link>
              );
            })}
          </nav>
          <AccountSwitcher className="border-t px-3 py-3" />
        </aside>

        <header className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-2.5 md:hidden">
          <Logo compactBelow360 />
          <AccountSwitcher className="min-w-0 flex-1" />
        </header>

        {/* Pages scroll their own content; main scrolls only what can't shrink further (a short window). */}
        <div className={APP_SHELL.contentClass}>
          <main id={APP_SHELL.mainId} tabIndex={-1} className={APP_SHELL.mainClass}>
            <LoginOutcome />
            <StaleBanner />
            <SyncError />
            <AccountGate pathname={pathname}>
              <Outlet />
            </AccountGate>
          </main>
          <TransferStatus />
        </div>

        <nav
          className="flex shrink-0 border-t pb-[env(safe-area-inset-bottom)] md:hidden"
          aria-label="Primary"
        >
          {NAV_ITEMS.map(({ to, key, icon }) => {
            const Icon = ICONS[icon];
            return (
              <Link
                key={to}
                to={to}
                preload="intent"
                activeOptions={{ exact: to === "/" }}
                className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] text-muted-foreground max-[360px]:tracking-tight"
                activeProps={{ className: "text-foreground" }}
              >
                <Icon size={18} strokeWidth={1.75} />
                {COPY.nav[key]}
              </Link>
            );
          })}
        </nav>
      </div>
    </AuthGate>
  );
}
