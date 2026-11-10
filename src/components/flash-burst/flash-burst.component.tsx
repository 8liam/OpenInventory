import { useId } from "react";
import { FLASH_BURST } from "./flash-burst.config";
import type { FlashBurstProps } from "./flash-burst.types";

const B = FLASH_BURST;
const FULL_TURN = Math.PI * 2;
const RAYS = Array.from({ length: B.rayCount }, (_, index) => {
  const angle = (index / B.rayCount) * FULL_TURN;
  const long = index % 2 === 0;
  const reach = long ? B.rayLong : B.rayShort;
  return {
    long,
    x1: B.center + Math.cos(angle) * B.rayInner,
    y1: B.center + Math.sin(angle) * B.rayInner,
    x2: B.center + Math.cos(angle) * reach,
    y2: B.center + Math.sin(angle) * reach,
  };
});

/** The flash of a going-off flashbang, in a theme's accent and primary colours. */
export function FlashBurst({ variant, className }: FlashBurstProps) {
  const id = useId();
  const colorOf = { white: B.white, accent: variant.accent, primary: variant.primary };
  return (
    <svg viewBox={B.viewBox} className={className} aria-hidden="true">
      <defs>
        <radialGradient id={id}>
          {B.stops.map((stop) => (
            <stop
              key={stop.offset}
              offset={stop.offset}
              stopColor={colorOf[stop.source]}
              stopOpacity={stop.opacity}
            />
          ))}
        </radialGradient>
      </defs>
      <g className={B.raysClass}>
        {RAYS.map((ray) => (
          <line
            key={`${ray.x2}-${ray.y2}`}
            x1={ray.x1}
            y1={ray.y1}
            x2={ray.x2}
            y2={ray.y2}
            stroke={ray.long ? variant.primary : variant.accent}
            strokeWidth={ray.long ? B.rayWidth.long : B.rayWidth.short}
            strokeLinecap="round"
            opacity={B.rayOpacity}
          />
        ))}
      </g>
      <circle
        className={B.coreClass}
        cx={B.center}
        cy={B.center}
        r={B.coreRadius}
        fill={`url(#${id})`}
      />
    </svg>
  );
}
