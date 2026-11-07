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
  storedLocally: "Rules are saved in this browser only.",
  run: "Run plan…",
  runBlocked: "Fix the problems above to run the plan.",
  busy: "A transfer is already running.",
  dialog: {
    title: "Run this plan?",
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
