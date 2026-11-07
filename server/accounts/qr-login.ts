import QRCode from "qrcode";
import { EAuthTokenPlatformType, LoginSession } from "steam-session";
import { AUTH_STATUS, STORAGE_LIMITS } from "../../src/lib/storage/storage.config.ts";
import type { AuthState } from "../../src/lib/storage/storage.types.ts";
import type { SavedSession } from "../steam/session-file.ts";

export type QrLogin = {
  readonly getState: () => AuthState;
  readonly subscribe: (listener: () => void) => () => void;
  /** Starts a new attempt, replacing any in progress. Resolves once the QR code is showing. */
  readonly start: () => Promise<void>;
  /** Abandons the attempt in progress, if any. */
  readonly cancel: () => void;
};

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Runs Steam's QR sign-in. It is not tied to an account: whoever approves it in the
 * Steam app is the account that gets added, and `onAuthenticated` receives its login.
 */
export function createQrLogin(onAuthenticated: (session: SavedSession) => void): QrLogin {
  let state: AuthState = { status: AUTH_STATUS.signedOut };
  let current: LoginSession | undefined;
  const listeners = new Set<() => void>();

  function setState(next: AuthState): void {
    state = next;
    for (const listener of listeners) listener();
  }

  function cancel(): void {
    current?.cancelLoginAttempt();
    current = undefined;
    setState({ status: AUTH_STATUS.signedOut });
  }

  return {
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    cancel,
    async start() {
      current?.cancelLoginAttempt();
      const session = new LoginSession(EAuthTokenPlatformType.SteamClient);
      session.loginTimeout = STORAGE_LIMITS.qrLoginTimeoutMs;
      current = session;
      // steam-session keeps its login timer running after `authenticated`, so
      // timeout/error must only count while this attempt is still pending.
      const isPending = () => current === session;
      const fail = (message: string) => {
        current = undefined;
        session.cancelLoginAttempt();
        setState({ status: AUTH_STATUS.error, message });
      };
      session.on("timeout", () => {
        if (isPending()) fail("QR login timed out. Start again.");
      });
      session.on("error", (error: Error) => {
        if (isPending()) fail(`Login failed: ${error.message}`);
      });
      session.on("authenticated", () => {
        if (!isPending()) return;
        const { accountName, steamID, refreshToken } = session;
        current = undefined;
        session.cancelLoginAttempt();
        setState({ status: AUTH_STATUS.signedOut });
        onAuthenticated({ refreshToken, accountName, steamId: steamID.getSteamID64() });
      });
      try {
        const { qrChallengeUrl } = await session.startWithQR();
        if (!qrChallengeUrl) throw new Error("Steam did not return a QR challenge");
        const qrSvg = await QRCode.toString(qrChallengeUrl, { type: "svg", margin: 1 });
        if (!isPending()) return;
        setState({ status: AUTH_STATUS.qrPending, qrSvg });
        // Fired once the QR code has been scanned; the user still has to approve.
        session.on("remoteInteraction", () => {
          if (isPending())
            setState({
              status: AUTH_STATUS.connecting,
              detail: "Approve the sign-in in the Steam app…",
            });
        });
      } catch (error) {
        if (isPending()) fail(`Could not start Steam QR login: ${toErrorMessage(error)}`);
      }
    },
  };
}
