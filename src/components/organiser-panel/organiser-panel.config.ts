import { CONDITION_KIND } from "~/lib/organiser/organiser.config";

export const ORGANISER_PANEL = {
  title: "Organise storage units",
  description:
    "Rules decide where items belong. The first matching rule wins. Preview the plan, then confirm to run it.",
  rulesHeading: "Rules",
  noRules: "No rules yet.",
  rulePrefix: (index: number) => `${index}.`,
  conditionText: {
    [CONDITION_KIND.category]: (value: string) => `type is ${value}`,
    [CONDITION_KIND.rarity]: (value: string) => `rarity is ${value}`,
    [CONDITION_KIND.collection]: (value: string) => `collection is ${value}`,
    [CONDITION_KIND.name]: (value: string) => `name contains “${value}”`,
  },
  conditionJoin: " and ",
  ruleText: (conditions: string, unit: string) => `${conditions} → ${unit}`,
  missingUnit: "(missing unit)",
  moveUp: "Move rule up",
  moveDown: "Move rule down",
  remove: "Remove rule",
  itemsUnavailable: "Waiting for your items to load before a plan can be previewed.",
  storedLocally: "Rules are saved in this browser only, separately for each account.",
  iconSize: 14,
  classes: {
    /** Scrolls on its own under the page header. */
    root: "flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto",
    muted: "text-muted-foreground",
    note: "text-xs text-muted-foreground",
    heading: "font-medium",
    rules: "flex flex-col gap-2",
    ruleList: "flex flex-col gap-1",
    rule: "flex items-center justify-between gap-2 rounded border px-3 py-1.5 text-sm",
    ruleText: "min-w-0 truncate",
    rulePrefix: "tabular text-muted-foreground",
    ruleActions: "flex shrink-0 gap-1",
    runRow: "flex flex-wrap items-center gap-3",
    /** Stands in for `disabled:` styles: the button stays focusable and ignores presses. */
    runBlocked: "pointer-events-none opacity-50",
  },
  run: "Run plan…",
  /** Why Run is disabled, checked in this order; short, since the dry run above gives the detail. */
  needsRules: "No rules to run yet.",
  runBlocked: "Fix the problems above to run the plan.",
  nothingToMove: "Already organised, so there's nothing to run.",
  noMatches: "No items match these rules, so there's nothing to run.",
  busy: "A transfer is already running.",
  dialog: {
    title: "Run this plan?",
    titleFor: (account: string) => `Run this plan on ${account}?`,
    warning: (items: number, steps: number) =>
      `This moves ${items} ${items === 1 ? "item" : "items"} in ${steps} ${steps === 1 ? "step" : "steps"}.`,
    effects: [
      "Items are moved one at a time and each move is confirmed by Steam.",
      "Unit-to-unit moves pass through your inventory.",
      "You can cancel while it runs; items already moved stay moved.",
    ],
    acknowledgement: "I've reviewed the dry run and want to move these items.",
    confirm: "Move items",
    working: "Starting…",
    cancel: "Cancel",
  },
} as const;
