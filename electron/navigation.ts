import { EXTERNAL_PROTOCOLS } from "./electron.config.ts";

/** True only for web links; `shell.openExternal` otherwise launches whatever handler the OS has for the scheme (file:, smb:, custom apps). */
export function isSafeExternalUrl(target: string): boolean {
  try {
    return EXTERNAL_PROTOCOLS.includes(new URL(target).protocol);
  } catch {
    return false;
  }
}

/** True when `target` is on exactly the same origin as the local app (a prefix check would also match another port). */
export function isAppUrl(target: string, appUrl: string): boolean {
  try {
    return new URL(target).origin === new URL(appUrl).origin;
  } catch {
    return false;
  }
}
