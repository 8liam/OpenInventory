/**
 * Moves focus to `target` if the focused element has just been removed, which leaves focus on
 * `<body>` and keyboard users at the top of the page. Focus anywhere else is left alone.
 */
export function restoreLostFocus(target: HTMLElement | null | undefined): void {
  const active = document.activeElement;
  if (active === null || active === document.body) target?.focus({ preventScroll: true });
}
