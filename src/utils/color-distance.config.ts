/** Linear sRGB to Oklab (Björn Ottosson): LMS weights, then the Lab rows. */
export const OKLAB_FORWARD = {
  lmsFromRgb: [
    [0.4122214708, 0.5363325363, 0.0514459929],
    [0.2119034982, 0.6806995451, 0.1073969566],
    [0.0883024619, 0.2817188376, 0.6299787005],
  ],
  labFromLms: [
    [0.2104542553, 0.793617785, -0.0040720468],
    [1.9779984951, -2.428592205, 0.4505937099],
    [0.0259040371, 0.7827717662, -0.808675766],
  ],
  cubeRoot: 1 / 3,
} as const;

/** Colour-vision deficiency simulation in linear sRGB (Machado, Oliveira and Fernandes 2009, severity 1). */
export const CVD_MATRICES = {
  deuteranopia: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
  protanopia: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
} as const;

export const HEX_RADIX = 16;
export const HEX_CHANNEL_DIGITS = 2;
