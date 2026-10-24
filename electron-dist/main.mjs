// electron/main.ts
import { app as app3, BrowserWindow, dialog as dialog2, shell as shell2 } from "electron";

// electron/electron.config.ts
var APP_NAME = "OpenInventory";
var SERVER_HOST = "127.0.0.1";
var WINDOW = {
  width: 1360,
  height: 900,
  minWidth: 960,
  minHeight: 640,
  backgroundColor: "#0b0b0f",
};
var SERVER_PROCESS = {
  /** Paths relative to the app root; the package is unpacked (no asar) so these are plain files. */
  entry: ["electron-dist", "server.mjs"],
  webDir: ["dist"],
  dataSubdir: "data",
  startupTimeoutMs: 2e4,
  pollIntervalMs: 150,
  serviceName: "openinventory-server",
};
var SELF_INSTALL_PLATFORMS = ["win32", "linux"];
var UPDATER = {
  releasesUrl: "https://github.com/8liam/OpenInventory/releases/latest",
  checkIntervalMs: 6 * 60 * 60 * 1e3,
  /** Platforms that can install updates themselves (macOS needs a signed app for that). */
  selfInstallPlatforms: SELF_INSTALL_PLATFORMS,
};
var UPDATER_STRINGS = {
  readyTitle: "Update ready",
  readyMessage: (version) => `OpenInventory ${version} has been downloaded.`,
  readyDetail: "Restart now to install it, or it will install the next time you quit.",
  restart: "Restart now",
  later: "Later",
  availableTitle: "Update available",
  availableMessage: (version) => `OpenInventory ${version} is available.`,
  availableDetail: "Download the latest release to update.",
  download: "Open download page",
  dismiss: "Not now",
  startupFailed: "OpenInventory could not start its local server.",
};

// electron/server-process.ts
import { app, utilityProcess } from "electron";
import { createServer } from "node:net";
import { join as join2 } from "node:path";

// server/server.config.ts
import { homedir } from "node:os";
import { join } from "node:path";
var DEFAULT_DATA_DIR = join(homedir(), ".openinventory");
var ENV = {
  host: "OPENINVENTORY_HOST",
  port: "OPENINVENTORY_PORT",
  dataDir: "OPENINVENTORY_DATA_DIR",
  password: "OPENINVENTORY_PASSWORD",
  webDir: "OPENINVENTORY_WEB_DIR",
};
var SERVER_LIMITS = {
  /** Minimum gap between persisted value snapshots. */
  snapshotIntervalMs: 60 * 60 * 1e3,
  snapshotRetentionDays: 730,
  /** Lets unit contents finish loading before the first background snapshot. */
  snapshotInitialDelayMs: 9e4,
  basicAuthRealm: "OpenInventory",
  basicAuthUser: "openinventory",
};

// electron/server-process.ts
function freePort() {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once("error", reject);
    probe.listen(0, SERVER_HOST, () => {
      const address = probe.address();
      probe.close(() =>
        typeof address === "object" && address
          ? resolve(address.port)
          : reject(new Error("Could not allocate a port")),
      );
    });
  });
}
async function waitUntilServing(url, hasExited) {
  const deadline = Date.now() + SERVER_PROCESS.startupTimeoutMs;
  while (Date.now() < deadline) {
    if (hasExited()) throw new Error("Server process exited during startup");
    try {
      await fetch(url);
      return;
    } catch {
      await new Promise((r) => setTimeout(r, SERVER_PROCESS.pollIntervalMs));
    }
  }
  throw new Error("Timed out waiting for the server to start");
}
async function startServer() {
  const port = await freePort();
  const root = app.getAppPath();
  const url = `http://${SERVER_HOST}:${port}`;
  let exited = false;
  const child = utilityProcess.fork(join2(root, ...SERVER_PROCESS.entry), [], {
    serviceName: SERVER_PROCESS.serviceName,
    stdio: "inherit",
    env: {
      ...process.env,
      [ENV.host]: SERVER_HOST,
      [ENV.port]: String(port),
      [ENV.dataDir]: join2(app.getPath("userData"), SERVER_PROCESS.dataSubdir),
      [ENV.webDir]: join2(root, ...SERVER_PROCESS.webDir),
    },
  });
  child.once("exit", () => {
    exited = true;
  });
  try {
    await waitUntilServing(url, () => exited);
  } catch (error) {
    child.kill();
    throw error;
  }
  return { url, stop: () => void child.kill() };
}

// electron/updater.ts
import { app as app2, dialog, shell } from "electron";
import electronUpdater from "electron-updater";
var { autoUpdater } = electronUpdater;
function selfInstalls() {
  return UPDATER.selfInstallPlatforms.includes(process.platform);
}
function initAutoUpdate() {
  if (!app2.isPackaged) return;
  autoUpdater.autoDownload = selfInstalls();
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.on("error", (error) => console.warn("[updater]", error));
  autoUpdater.on("update-downloaded", async ({ version }) => {
    const { response } = await dialog.showMessageBox({
      type: "info",
      title: UPDATER_STRINGS.readyTitle,
      message: UPDATER_STRINGS.readyMessage(version),
      detail: UPDATER_STRINGS.readyDetail,
      buttons: [UPDATER_STRINGS.restart, UPDATER_STRINGS.later],
      defaultId: 0,
      cancelId: 1,
    });
    if (response === 0) autoUpdater.quitAndInstall();
  });
  autoUpdater.on("update-available", async ({ version }) => {
    if (selfInstalls()) return;
    const { response } = await dialog.showMessageBox({
      type: "info",
      title: UPDATER_STRINGS.availableTitle,
      message: UPDATER_STRINGS.availableMessage(version),
      detail: UPDATER_STRINGS.availableDetail,
      buttons: [UPDATER_STRINGS.download, UPDATER_STRINGS.dismiss],
      defaultId: 0,
      cancelId: 1,
    });
    if (response === 0) void shell.openExternal(UPDATER.releasesUrl);
  });
  const check = () => void autoUpdater.checkForUpdates().catch(() => void 0);
  check();
  setInterval(check, UPDATER.checkIntervalMs);
}

// electron/main.ts
var server;
var mainWindow;
function openWindow(url) {
  const window = new BrowserWindow({ ...WINDOW, title: APP_NAME, autoHideMenuBar: true });
  mainWindow = window;
  window.on("closed", () => {
    mainWindow = void 0;
  });
  window.webContents.setWindowOpenHandler(({ url: target }) => {
    void shell2.openExternal(target);
    return { action: "deny" };
  });
  window.webContents.on("will-navigate", (event, target) => {
    if (!target.startsWith(url)) {
      event.preventDefault();
      void shell2.openExternal(target);
    }
  });
  void window.loadURL(url);
}
if (!app3.requestSingleInstanceLock()) {
  app3.quit();
} else {
  app3.on("second-instance", () => {
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  });
  app3.on("window-all-closed", () => app3.quit());
  app3.on("before-quit", () => server?.stop());
  app3.on("activate", () => {
    if (server && BrowserWindow.getAllWindows().length === 0) openWindow(server.url);
  });
  void app3.whenReady().then(async () => {
    try {
      server = await startServer();
    } catch (error) {
      dialog2.showErrorBox(
        APP_NAME,
        `${UPDATER_STRINGS.startupFailed}

${String(error)}`,
      );
      app3.quit();
      return;
    }
    openWindow(server.url);
    initAutoUpdate();
  });
}
