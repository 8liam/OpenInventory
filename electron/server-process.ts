import { app, utilityProcess } from "electron";
import { createServer } from "node:net";
import { join } from "node:path";
import { ENV } from "../server/server.config.ts";
import { SERVER_HOST, SERVER_PROCESS } from "./electron.config.ts";
import type { RunningServer } from "./electron.types.ts";

function freePort(): Promise<number> {
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

async function waitUntilServing(url: string, hasExited: () => boolean): Promise<void> {
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

/** Runs the bundled OpenInventory API + web app in an isolated process on a free local port. */
export async function startServer(): Promise<RunningServer> {
  const port = await freePort();
  const root = app.getAppPath();
  const url = `http://${SERVER_HOST}:${port}`;
  let exited = false;
  const child = utilityProcess.fork(join(root, ...SERVER_PROCESS.entry), [], {
    serviceName: SERVER_PROCESS.serviceName,
    stdio: "inherit",
    env: {
      ...process.env,
      [ENV.host]: SERVER_HOST,
      [ENV.port]: String(port),
      [ENV.dataDir]: join(app.getPath("userData"), SERVER_PROCESS.dataSubdir),
      [ENV.webDir]: join(root, ...SERVER_PROCESS.webDir),
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
