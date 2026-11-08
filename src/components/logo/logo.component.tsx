import { cn } from "~/utils/cn";
import { LOGO } from "./logo.config";
import type { LogoProps } from "./logo.types";

export function LogoMark({ className }: LogoProps) {
  return <img src={LOGO.src} alt="" className={cn("size-6", className)} />;
}

export function Logo({ className, compactBelow360 = false }: LogoProps) {
  return (
    <span
      className={cn("flex items-center gap-2 text-[15px] font-semibold tracking-tight", className)}
    >
      <LogoMark />
      <span className={compactBelow360 ? "max-[360px]:sr-only" : undefined}>{LOGO.name}</span>
    </span>
  );
}
