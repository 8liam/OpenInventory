/** ChainSkins hosted 3D embed: https://3d.chainskins.net/api */
export const SKIN_VIEWER_ORIGIN = "https://3d.chainskins.net";
export const SKIN_VIEWER_EMBED_PATH = "/embed";

export const SKIN_VIEWER_PARAMS = {
  defIndex: "def",
  paintIndex: "paint",
  float: "float",
  seed: "seed",
} as const;

/** The embed clamps float to the skin's range; outside 0-1 it is meaningless. */
export const SKIN_VIEWER_FLOAT_RANGE = { min: 0, max: 1 } as const;
export const SKIN_VIEWER_SEED_RANGE = { min: 1, max: 1000 } as const;

/** Messages the embed posts to its parent. */
export const SKIN_VIEWER_MESSAGES = {
  ready: "cs3d:ready",
  loading: "cs3d:loading",
  loaded: "cs3d:loaded",
  error: "cs3d:error",
  key: "cs3d:key",
} as const;
export const SKIN_VIEWER_ESCAPE_KEY = "Escape";
