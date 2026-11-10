/** Geometry of the flashbang art (an upright grenade in a 220 x 240 box), and how theme tokens colour it. */
export const FLASHBANG = {
  viewBox: "0 0 220 240",
  /** Where the grenade sits in the box, and the point it tilts around. */
  offset: { x: 46, y: 22 },
  pivot: { x: 68, y: 100 },
  defaultAngle: 12,
  /** Rendered size at scale 1, in px. */
  size: { width: 64, height: 70 },
  black: "#000",
  white: "#fff",
  /** Percent of the primary kept when shading the tube's lit edge, shadow edge and the caps. */
  shade: { lit: 80, dark: 42, capEdge: 8, cap: 26, ink: 25 },
  tube: { x: 36, y: 50, width: 40, height: 100 },
  band: { x: 33, y: 85, width: 46, height: 13, radius: 2 },
  hole: { radius: 7.4, inner: 6, glint: 3.2, glintOffset: { x: -1.4, y: 1.6 }, glintOpacity: 0.55 },
  holes: [
    { x: 48, y: 66 },
    { x: 65, y: 66 },
    { x: 47, y: 111 },
    { x: 64, y: 111 },
    { x: 55.5, y: 134 },
  ],
  topCap: "M33 30 H79 L84 35 V46 L79 51 H33 L28 46 V35Z",
  bottomCap: "M30 148 H82 L88 154 V172 L82 178 H30 L24 172 V154Z",
  /** Vertical edges of the hex-nut faces, as [x, y1, y2]. */
  capEdges: [
    [42, 31, 50],
    [70, 31, 50],
    [40, 149, 177],
    [72, 149, 177],
  ],
  /** Stamped text on the caps, as [x, y, width]. */
  stamps: [
    [46, 38, 10],
    [58, 38, 8],
    [49, 43, 15],
    [44, 158, 26],
    [48, 163, 18],
  ],
  head: "M40 31 V21 Q40 8 53 8 H62 Q74 8 74 20 V31Z",
  striker: { x: 62, y: 3, width: 13, height: 8, radius: 3 },
  /** Darkening of the head (mixed from the text colour with black). */
  headShade: 42,
  spoon: "M72 18 C84 18 84 28 83 46 L82 150 Q82 164 88 172",
  pin: { x1: 74, y1: 16, x2: 92, y2: 12 },
  ring: { cx: 106, cy: 24, r: 14 },
  stroke: { spoon: 3.6, spoonOutline: 5.6, pin: 2.4, ring: 3 },
  outlineOpacity: 0.3,
  edgeLineOpacity: 0.22,
  stampOpacity: 0.5,
} as const;
