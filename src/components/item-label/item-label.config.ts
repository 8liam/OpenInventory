export const ITEM_LABEL = {
  nameSeparator: " | ",
  /**
   * How the skin name fits: `single` truncates to one line (fixed-height wide table rows),
   * `double` wraps to two (compact rows, sized for it), `responsive` wraps on phones only.
   */
  nameClass: {
    single: "truncate leading-tight",
    double: "break-words leading-tight line-clamp-2 whitespace-normal",
    wrap: "break-words leading-tight whitespace-normal",
    responsive:
      "break-words leading-tight max-md:line-clamp-2 max-md:whitespace-normal md:truncate",
  },
} as const;
