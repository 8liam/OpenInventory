export type ScrollArea = {
  /** Width in px that content can use: the client width, inside any vertical scrollbar. */
  readonly width: number;
  /** Width in px of the vertical scrollbar (0 for overlay scrollbars). */
  readonly gutter: number;
};
