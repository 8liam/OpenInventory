/**
 * Moves focus to `target` if the focused element has just been removed, which leaves focus on
 * `<body>` and keyboard users at the top of the page. Focus still inside `closing` (a dialog
 * that has just closed and hidden it) counts as lost too. Focus anywhere else is left alone.
 */
export function restoreLostFocus(
  target: HTMLElement | null | undefined,
  closing?: Element | null,
): void {
  const active = document.activeElement;
  if (active === null || active === document.body || closing?.contains(active))
    target?.focus({ preventScroll: true });
}
