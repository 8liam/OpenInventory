export const HEX_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
export const OKLCH_PATTERN = /^oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)\s*\)$/i;

export const SRGB = {
  channelMax: 255,
  linearThreshold: 0.04045,
  linearDivisor: 12.92,
  gammaOffset: 0.055,
  gammaDivisor: 1.055,
  gammaExponent: 2.4,
  luminanceWeights: [0.2126, 0.7152, 0.0722],
  contrastOffset: 0.05,
} as const;

/** Oklab to linear sRGB (Björn Ottosson). */
export const OKLAB = {
  degreesPerHalfTurn: 180,
  lmsFromLab: [
    [0.3963377774, 0.2158037573],
    [-0.1055613458, -0.0638541728],
    [-0.0894841775, -1.291485548],
  ],
  rgbFromLms: [
    [4.0767416621, -3.3077115913, 0.2309699292],
    [-1.2684380046, 2.6097574011, -0.3413193965],
    [-0.0041960863, -0.7034186147, 1.707614701],
  ],
  cubeExponent: 3,
} as const;

/** Text colours offered when picking what reads best on an arbitrary background. */
export const READABLE_TEXT = { dark: "#000000", light: "#ffffff" } as const;

export const CONTRAST_ERRORS = {
  unsupported: "Unsupported colour",
} as const;
