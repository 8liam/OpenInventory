import { useId } from "react";
import { mixColors } from "~/utils/css-color";
import { FLASHBANG } from "./flashbang.config";
import type { FlashbangProps } from "./flashbang.types";

const F = FLASHBANG;

/**
 * A CS flashbang painted from a theme variant: the tube and caps take the primary, the ring band
 * the accent, the vent holes the surface colour, and the head, spoon and ring the text colour.
 */
export function Flashbang({ variant, angle = F.defaultAngle, className }: FlashbangProps) {
  const id = useId();
  const body = variant.primary;
  const shadow = mixColors(body, F.black, F.shade.dark);
  const capColor = mixColors(body, F.black, F.shade.cap);
  const capEdge = mixColors(body, F.black, F.shade.capEdge);
  const head = mixColors(variant.foreground, F.black, F.headShade);
  const ink = mixColors(variant.foreground, "transparent", F.shade.ink);
  const holeRim = mixColors(body, F.black, F.shade.ink);
  const transform = `translate(${F.offset.x} ${F.offset.y}) rotate(${angle} ${F.pivot.x} ${F.pivot.y})`;
  return (
    <svg
      viewBox={F.viewBox}
      width={F.size.width}
      height={F.size.height}
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-tube`} x1="0" x2="1">
          <stop offset="0" style={{ stopColor: mixColors(body, F.white, F.shade.lit) }} />
          <stop offset=".28" style={{ stopColor: body }} />
          <stop offset="1" style={{ stopColor: shadow }} />
        </linearGradient>
        <linearGradient id={`${id}-cap`} x1="0" x2="1">
          <stop offset="0" style={{ stopColor: capEdge }} />
          <stop offset="1" style={{ stopColor: capColor }} />
        </linearGradient>
      </defs>
      <g transform={transform}>
        <rect {...F.tube} fill={`url(#${id}-tube)`} />
        {F.holes.map((hole) => (
          <g key={`${hole.x}-${hole.y}`}>
            <circle cx={hole.x} cy={hole.y} r={F.hole.radius} style={{ fill: holeRim }} />
            <circle cx={hole.x} cy={hole.y} r={F.hole.inner} style={{ fill: variant.card }} />
            <circle
              cx={hole.x + F.hole.glintOffset.x}
              cy={hole.y + F.hole.glintOffset.y}
              r={F.hole.glint}
              style={{ fill: variant.accent, opacity: F.hole.glintOpacity }}
            />
          </g>
        ))}
        <rect
          {...F.band}
          rx={F.band.radius}
          style={{ fill: variant.accent, stroke: mixColors(variant.accent, F.black, 70) }}
        />
        {[F.topCap, F.bottomCap].map((path) => (
          <path key={path} d={path} fill={`url(#${id}-cap)`} style={{ stroke: ink }} />
        ))}
        {F.capEdges.map(([x, y1, y2]) => (
          <line
            key={`${x}-${y1}`}
            x1={x}
            x2={x}
            y1={y1}
            y2={y2}
            style={{ stroke: F.black, strokeOpacity: F.edgeLineOpacity }}
          />
        ))}
        {F.stamps.map(([x, y, width]) => (
          <rect
            key={`${x}-${y}`}
            x={x}
            y={y}
            width={width}
            height={2}
            rx={1}
            style={{ fill: variant.foreground, opacity: F.stampOpacity }}
          />
        ))}
        <path d={F.head} style={{ fill: head }} />
        <rect {...F.striker} rx={F.striker.radius} style={{ fill: head }} />
        <path
          d={F.spoon}
          fill="none"
          strokeWidth={F.stroke.spoonOutline}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ stroke: F.black, strokeOpacity: F.outlineOpacity }}
        />
        <path
          d={F.spoon}
          fill="none"
          strokeWidth={F.stroke.spoon}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ stroke: variant.foreground }}
        />
        <line
          {...F.pin}
          strokeWidth={F.stroke.pin}
          strokeLinecap="round"
          style={{ stroke: variant.foreground }}
        />
        <circle
          {...F.ring}
          fill="none"
          strokeWidth={F.stroke.ring}
          style={{ stroke: variant.foreground }}
        />
      </g>
    </svg>
  );
}
