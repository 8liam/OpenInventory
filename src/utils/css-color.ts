/** `color-mix` of `a` (at `percentOfA`) with `b`; both can be any CSS colour, including `var()`. */
export function mixColors(a: string, b: string, percentOfA: number): string {
  return `color-mix(in srgb, ${a} ${percentOfA}%, ${b})`;
}
