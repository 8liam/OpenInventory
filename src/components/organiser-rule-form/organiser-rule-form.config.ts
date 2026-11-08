import { CONDITION_KIND } from "~/lib/organiser/organiser.config";

export const RULE_FORM = {
  heading: "New rule",
  kindLabels: {
    [CONDITION_KIND.category]: "Type is",
    [CONDITION_KIND.rarity]: "Rarity is",
    [CONDITION_KIND.collection]: "Collection is",
    [CONDITION_KIND.name]: "Name contains",
  },
  conditionKindLabel: "Condition type",
  valueLabel: "Condition value",
  valuePlaceholder: "Value",
  addCondition: "Add condition",
  removeCondition: "Remove condition",
  targetLabel: "Move matching items to",
  chooseTarget: "Choose a unit",
  addRule: "Add rule",
  invalid: "Fill in every condition and choose a unit.",
  inputClass:
    "h-8 min-w-0 max-w-sm flex-1 rounded border bg-background px-2 text-sm outline-none focus:border-primary/60",
  listIdPrefix: "organiser-suggestions-",
} as const;
