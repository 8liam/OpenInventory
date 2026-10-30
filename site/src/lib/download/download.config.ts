import type { PlatformSpec } from "./download.types";

export const REPO = "8liam/OpenInventory";
export const RELEASES_PAGE = `https://github.com/${REPO}/releases/latest`;
export const RELEASE_API = `https://api.github.com/repos/${REPO}/releases/latest`;
export const DEFAULT_PLATFORM = "mac-arm64";

export const PLATFORMS = [
  {
    id: "mac-arm64",
    label: "macOS (Apple Silicon)",
    short: "macOS Apple Silicon",
    icon: "apple",
    asset: /mac-arm64\.dmg$/,
  },
  {
    id: "mac-x64",
    label: "macOS (Intel)",
    short: "macOS Intel",
    icon: "apple",
    asset: /mac-x64\.dmg$/,
  },
  { id: "win-x64", label: "Windows", short: "Windows", icon: "windows", asset: /win-x64\.exe$/ },
  {
    id: "linux-x64",
    label: "Linux",
    short: "Linux",
    icon: "linux",
    asset: /linux-x86_64\.AppImage$/,
  },
] as const satisfies readonly PlatformSpec[];

export const COPY = {
  fallbackLabel: "Download",
} as const;

/** Pattern the WebGL renderer string matches on Apple Silicon Macs. */
export const APPLE_SILICON_RENDERER = /apple (m\d|gpu)/i;
