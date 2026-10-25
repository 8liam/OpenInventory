import { Link, Outlet } from "@tanstack/react-router";
import {
  ArrowLeftRight,
  Boxes,
  Laptop,
  LayoutDashboard,
  LogOut,
  Package,
  PackageOpen,
  Settings,
} from "lucide-react";
import type { ComponentType } from "react";
import { AuthGate } from "~/components/auth-gate/auth-gate.component";
import { Logo } from "~/components/logo/logo.component";
import { TransferStatus } from "~/components/transfer-status/transfer-status.component";
import { COPY } from "~/lib/copy/copy.config";
import { callStorageApi, useStorageSnapshot } from "~/lib/storage/storage.client";
import { AUTH_STATUS, STORAGE_API } from "~/lib/storage/storage.config";
import { cn } from "~/utils/cn";
import { NAV_ITEMS } from "./app-shell.config";

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

function AccountChip({ className }: { readonly className?: string }) {
  const { auth } = useStorageSnapshot();
  if (auth.status !== AUTH_STATUS.ready) return null;
  return (
    <div className={cn("flex items-center justify-between gap-2", className)}>
      <div className="flex min-w-0 items-center gap-2">
        <span className="size-1.5 shrink-0 rounded-full bg-success" aria-hidden />
        <span className="truncate text-[13px]">
          {auth.displayName ?? COPY.account.fallbackName}
        </span>
      </div>
      <button
        type="button"
        title={COPY.account.signOut}
        aria-label={COPY.account.signOut}
        onClick={() => void callStorageApi(STORAGE_API.logout)}
        className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
      >
        <LogOut size={14} />
      </button>
    </div>
  );
}

export function AppShell() {
  return (
    <AuthGate>
      <div className="flex h-dvh flex-col md:flex-row">
        <aside className="hidden w-56 shrink-0 flex-col border-r md:flex">
          <div className="px-4 py-4">
            <Logo />
          </div>
          <nav className="flex flex-1 flex-col gap-0.5 px-2">
            {NAV_ITEMS.map(({ to, key, icon }) => {
              const Icon = ICONS[icon];
              return (
                <Link
                  key={to}
                  to={to}
                  preload="intent"
                  activeOptions={{ exact: to === "/" }}
                  className="flex h-8 items-center gap-2.5 rounded-md px-2.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  activeProps={{ className: "bg-accent text-foreground" }}
                >
                  <Icon size={15} strokeWidth={1.75} />
                  {COPY.nav[key]}
                </Link>
              );
            })}
          </nav>
          <AccountChip className="border-t px-3 py-3" />
        </aside>

        <header className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-2.5 md:hidden">
          <Logo />
          <AccountChip className="min-w-0" />
        </header>

        <main className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden p-4 md:gap-5 md:p-6">
          <TransferStatus />
          <Outlet />
        </main>

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
                className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] text-muted-foreground"
                activeProps={{ className: "text-foreground" }}
              >
                <Icon size={18} strokeWidth={1.75} />
                {COPY.navShort[key]}
              </Link>
            );
          })}
        </nav>
      </div>
    </AuthGate>
  );
}
