import { TRANSFER_STATUS } from "./transfer-status.config";

/**
 * Puts focus on the transfer status region. Call it while the control that has focus is still
 * mounted and is about to go away because a transfer started, so focus never falls to `<body>`.
 */
export function focusTransferStatus(): void {
  document.getElementById(TRANSFER_STATUS.regionId)?.focus({ preventScroll: true });
}
