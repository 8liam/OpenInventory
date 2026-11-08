/**
 * Storage's units list sits beside the unit's contents only once the page is wide enough for
 * the 288px list and a table with every required column (56rem of content, about a 1170px
 * window with the sidebar). Narrower, the units scroll sideways above the contents. The
 * breakpoint is the page's own width, a container query, so it follows the sidebar too.
 */
export const STORAGE_PAGE = {
  containerClass: "@container/storage flex min-h-0 flex-1 flex-col",
  splitClass: "flex min-h-0 flex-1 flex-col gap-4 @min-[56rem]/storage:flex-row",
  unitsClass:
    "flex shrink-0 gap-2 overflow-x-auto @min-[56rem]/storage:w-72 @min-[56rem]/storage:flex-col @min-[56rem]/storage:overflow-x-visible @min-[56rem]/storage:overflow-y-auto",
  contentsClass: "flex min-h-0 min-w-0 flex-1 flex-col gap-3",
} as const;
