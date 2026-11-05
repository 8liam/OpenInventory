import { app, BrowserWindow, dialog, shell } from "electron";
import {
  ALLOWED_PERMISSIONS,
  APP_NAME,
  DESKTOP_UA_TOKEN,
  MAC_WINDOW,
  UPDATER_STRINGS,
  WEB_PREFERENCES,
  WINDOW,
} from "./electron.config.ts";
import { isAppUrl, isSafeExternalUrl } from "./navigation.ts";
import type { RunningServer } from "./electron.types.ts";
import { startServer } from "./server-process.ts";
import { initAutoUpdate } from "./updater.ts";

let server: RunningServer | undefined;
let mainWindow: BrowserWindow | undefined;

function openWindow(url: string): void {
  const isMac = process.platform === "darwin";
  const window = new BrowserWindow({
    ...WINDOW,
    ...(isMac ? MAC_WINDOW : {}),
    title: APP_NAME,
    autoHideMenuBar: true,
    webPreferences: WEB_PREFERENCES,
  });
  // Camera, geolocation, notifications and the rest are never needed, so only fullscreen is granted.
  window.webContents.session.setPermissionRequestHandler((_contents, permission, respond) =>
    respond(ALLOWED_PERMISSIONS.includes(permission)),
  );
  if (isMac) {
    window.webContents.setUserAgent(`${window.webContents.getUserAgent()} ${DESKTOP_UA_TOKEN}/mac`);
  }
  mainWindow = window;
  window.on("closed", () => {
    mainWindow = undefined;
  });
  // Anything that isn't the local app opens in the user's browser.
  // Only web links are handed to the OS; other schemes would launch arbitrary handlers.
  const openExternally = (target: string) => {
    if (isSafeExternalUrl(target)) void shell.openExternal(target);
  };
  window.webContents.setWindowOpenHandler(({ url: target }) => {
    openExternally(target);
    return { action: "deny" };
  });
  window.webContents.on("will-navigate", (event, target) => {
    if (!isAppUrl(target, url)) {
      event.preventDefault();
      openExternally(target);
    }
  });
  void window.loadURL(url);
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  });

  app.on("window-all-closed", () => app.quit());
  app.on("before-quit", () => server?.stop());
  app.on("activate", () => {
    if (server && BrowserWindow.getAllWindows().length === 0) openWindow(server.url);
  });

  void app.whenReady().then(async () => {
    try {
      server = await startServer();
    } catch (error) {
      dialog.showErrorBox(APP_NAME, `${UPDATER_STRINGS.startupFailed}\n\n${String(error)}`);
      app.quit();
      return;
    }
    openWindow(server.url);
    initAutoUpdate();
  });
}
