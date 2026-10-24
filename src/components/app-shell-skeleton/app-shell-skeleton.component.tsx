import { Logo } from "~/components/logo/logo.component";
import { LoadingRegion } from "~/components/loading-region/loading-region.component";
import { NAV_ITEMS } from "~/components/app-shell/app-shell.config";
import { Skeleton } from "~/components/skeleton/skeleton.component";
import { COPY } from "~/lib/copy/copy.config";

/**
 * Shown until the server reports whether we are signed in, so a returning user sees the app
 * frame appear in place instead of a flash of the sign-in screen.
 */
export function AppShellSkeleton() {
  return (
    <LoadingRegion className="flex h-dvh flex-col md:flex-row">
      <aside className="hidden w-56 shrink-0 flex-col border-r md:flex">
        <div className="px-4 py-4">
          <Logo />
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 px-2">
          {NAV_ITEMS.map(({ key }) => (
            <span
              key={key}
              className="flex h-8 items-center gap-2.5 rounded-md px-2.5 text-muted-foreground"
            >
              <Skeleton className="size-[15px]" />
              {COPY.nav[key]}
            </span>
          ))}
        </nav>
        <div className="flex items-center justify-between gap-2 border-t px-3 py-3">
          <Skeleton className="h-lh w-28" />
          <Skeleton className="size-[26px] rounded-md" />
        </div>
      </aside>
      <header className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-2.5 md:hidden">
        <Logo />
        <Skeleton className="h-lh w-24" />
      </header>
      <main className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden p-4 md:gap-5 md:p-6">
        <div>
          <Skeleton className="h-7 w-40" />
          <Skeleton className="mt-0.5 h-4 w-72 max-w-full" />
        </div>
      </main>
      <nav className="flex shrink-0 border-t pb-[env(safe-area-inset-bottom)] md:hidden">
        {NAV_ITEMS.map(({ key }) => (
          <span
            key={key}
            className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] text-muted-foreground"
          >
            <Skeleton className="size-[18px]" />
            {COPY.navShort[key]}
          </span>
        ))}
      </nav>
    </LoadingRegion>
  );
}
