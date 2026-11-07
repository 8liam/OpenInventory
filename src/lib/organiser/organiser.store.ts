import { create } from "zustand";
import { ORGANISER_LIMITS, ORGANISER_STORAGE_KEY } from "./organiser.config.ts";
import { rulesSchema, type OrganiserRule } from "./organiser.types.ts";

export type OrganiserState = {
  readonly rules: readonly OrganiserRule[];
  readonly addRule: (rule: OrganiserRule) => void;
  readonly removeRule: (id: string) => void;
  /** Rules are tried in order, so position is meaning; `-1` moves a rule earlier. */
  readonly moveRule: (id: string, offset: -1 | 1) => void;
};

function loadRules(): readonly OrganiserRule[] {
  try {
    const raw = localStorage.getItem(ORGANISER_STORAGE_KEY);
    if (!raw) return [];
    const parsed = rulesSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

function persist(rules: readonly OrganiserRule[]): void {
  try {
    localStorage.setItem(ORGANISER_STORAGE_KEY, JSON.stringify(rules));
  } catch {
    // Storage blocked or full: the rules still work for this session.
  }
}

export const useOrganiser = create<OrganiserState>((set, get) => {
  const save = (rules: readonly OrganiserRule[]): void => {
    set({ rules });
    persist(rules);
  };
  return {
    rules: loadRules(),
    addRule: (rule) => {
      if (get().rules.length < ORGANISER_LIMITS.maxRules) save([...get().rules, rule]);
    },
    removeRule: (id) => save(get().rules.filter((rule) => rule.id !== id)),
    moveRule: (id, offset) => {
      const rules = [...get().rules];
      const from = rules.findIndex((rule) => rule.id === id);
      const to = from + offset;
      const moving = rules[from];
      const swapped = rules[to];
      if (!moving || !swapped) return;
      rules[from] = swapped;
      rules[to] = moving;
      save(rules);
    },
  };
});
