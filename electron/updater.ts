import { app, dialog, shell } from "electron";
import electronUpdater from "electron-updater";
import { UPDATER, UPDATER_STRINGS } from "./electron.config.ts";

const { autoUpdater } = electronUpdater;

function selfInstalls(): boolean {
  return UPDATER.selfInstallPlatforms.includes(process.platform);
}

/** Checks GitHub Releases for a newer version and installs it (or points to the download). */
export function initAutoUpdate(): void {
  if (!app.isPackaged) return;

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

  const check = () => void autoUpdater.checkForUpdates().catch(() => undefined);
  check();
  setInterval(check, UPDATER.checkIntervalMs);
}
