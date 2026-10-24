export const APP_NAME = "OpenInventory";

export const SERVER_HOST = "127.0.0.1";

export const WINDOW = {
  width: 1360,
  height: 900,
  minWidth: 960,
  minHeight: 640,
  backgroundColor: "#0b0b0f",
} as const;

export const SERVER_PROCESS = {
  /** Paths relative to the app root; the package is unpacked (no asar) so these are plain files. */
  entry: ["electron-dist", "server.mjs"],
  webDir: ["dist"],
  dataSubdir: "data",
  startupTimeoutMs: 20_000,
  pollIntervalMs: 150,
  serviceName: "openinventory-server",
} as const;

const SELF_INSTALL_PLATFORMS: readonly NodeJS.Platform[] = ["win32", "linux"];

export const UPDATER = {
  releasesUrl: "https://github.com/8liam/OpenInventory/releases/latest",
  checkIntervalMs: 6 * 60 * 60 * 1000,
  /** Platforms that can install updates themselves (macOS needs a signed app for that). */
  selfInstallPlatforms: SELF_INSTALL_PLATFORMS,
} as const;

export const UPDATER_STRINGS = {
  readyTitle: "Update ready",
  readyMessage: (version: string) => `OpenInventory ${version} has been downloaded.`,
  readyDetail: "Restart now to install it, or it will install the next time you quit.",
  restart: "Restart now",
  later: "Later",
  availableTitle: "Update available",
  availableMessage: (version: string) => `OpenInventory ${version} is available.`,
  availableDetail: "Download the latest release to update.",
  download: "Open download page",
  dismiss: "Not now",
  startupFailed: "OpenInventory could not start its local server.",
} as const;
