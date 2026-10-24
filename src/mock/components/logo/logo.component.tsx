import { cn } from "~/utils/cn";
import { LOGO } from "./logo.config";
import type { LogoProps } from "./logo.types";

export function LogoMark({ className }: LogoProps) {
  return <img src={LOGO.src} alt="" className={cn("size-6", className)} />;
}

export function Logo({ className }: LogoProps) {
  return (
    <span
      className={cn("flex items-center gap-2 text-[15px] font-semibold tracking-tight", className)}
    >
      <LogoMark />
      {LOGO.name}
    </span>
  );
}
