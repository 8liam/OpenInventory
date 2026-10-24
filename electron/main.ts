import { app, BrowserWindow, dialog, shell } from "electron";
import { APP_NAME, UPDATER_STRINGS, WINDOW } from "./electron.config.ts";
import type { RunningServer } from "./electron.types.ts";
import { startServer } from "./server-process.ts";
import { initAutoUpdate } from "./updater.ts";

let server: RunningServer | undefined;
let mainWindow: BrowserWindow | undefined;

function openWindow(url: string): void {
  const window = new BrowserWindow({ ...WINDOW, title: APP_NAME, autoHideMenuBar: true });
  mainWindow = window;
  window.on("closed", () => {
    mainWindow = undefined;
  });
  // Anything that isn't the local app opens in the user's browser.
  window.webContents.setWindowOpenHandler(({ url: target }) => {
    void shell.openExternal(target);
    return { action: "deny" };
  });
  window.webContents.on("will-navigate", (event, target) => {
    if (!target.startsWith(url)) {
      event.preventDefault();
      void shell.openExternal(target);
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
