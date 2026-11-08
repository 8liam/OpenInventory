import { useMemo } from "react";
import { create } from "zustand";
import {
  ORGANISER_LIMITS,
  ORGANISER_STORAGE_KEY,
  ORGANISER_STORAGE_SEPARATOR,
} from "./organiser.config.ts";
import { rulesSchema, type OrganiserRule } from "./organiser.types.ts";

type OrganiserState = {
  /** Rules edited this session, by SteamID; accounts not here are read from storage on demand. */
  readonly rulesByAccount: Readonly<Record<string, readonly OrganiserRule[]>>;
  readonly save: (accountId: string, rules: readonly OrganiserRule[]) => void;
};

export type OrganiserRules = {
  readonly rules: readonly OrganiserRule[];
  readonly addRule: (rule: OrganiserRule) => void;
  readonly removeRule: (id: string) => void;
  /** Rules are tried in order, so position is meaning; `-1` moves a rule earlier. */
  readonly moveRule: (id: string, offset: -1 | 1) => void;
};

const NO_RULES: readonly OrganiserRule[] = [];

const storageKey = (accountId: string) =>
  `${ORGANISER_STORAGE_KEY}${ORGANISER_STORAGE_SEPARATOR}${accountId}`;

function parse(raw: string | null): readonly OrganiserRule[] | undefined {
  if (!raw) return undefined;
  try {
    const parsed = rulesSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : undefined;
  } catch {
    return undefined;
  }
}

function persist(accountId: string, rules: readonly OrganiserRule[]): void {
  try {
    localStorage.setItem(storageKey(accountId), JSON.stringify(rules));
  } catch {
    // Storage blocked or full: the rules still work for this session.
  }
}

/**
 * The account's saved rules. Rules saved before they were per account are adopted by the
 * first account whose units they all target, since only that account can have written them.
 */
function loadRules(accountId: string, unitIds: ReadonlySet<string>): readonly OrganiserRule[] {
  try {
    const own = parse(localStorage.getItem(storageKey(accountId)));
    if (own) return own;
    const legacy = parse(localStorage.getItem(ORGANISER_STORAGE_KEY));
    if (!legacy || legacy.length === 0 || !legacy.every((r) => unitIds.has(r.targetUnitId)))
      return NO_RULES;
    persist(accountId, legacy);
    localStorage.removeItem(ORGANISER_STORAGE_KEY);
    return legacy;
  } catch {
    return NO_RULES;
  }
}

const useOrganiserStore = create<OrganiserState>((set) => ({
  rulesByAccount: {},
  save: (accountId, rules) => {
    set((state) => ({ rulesByAccount: { ...state.rulesByAccount, [accountId]: rules } }));
    persist(accountId, rules);
  },
}));

/** One account's organiser rules and the edits on them; empty and inert without an account. */
export function useOrganiserRules(
  accountId: string | undefined,
  unitIds: ReadonlySet<string>,
): OrganiserRules {
  const edited = useOrganiserStore((state) =>
    accountId === undefined ? undefined : state.rulesByAccount[accountId],
  );
  const save = useOrganiserStore((state) => state.save);
  const rules = useMemo(
    () => edited ?? (accountId === undefined ? NO_RULES : loadRules(accountId, unitIds)),
    [edited, accountId, unitIds],
  );
  return useMemo(() => {
    const update = (next: readonly OrganiserRule[]) => {
      if (accountId !== undefined) save(accountId, next);
    };
    return {
      rules,
      addRule: (rule) => {
        if (rules.length < ORGANISER_LIMITS.maxRules) update([...rules, rule]);
      },
      removeRule: (id) => update(rules.filter((rule) => rule.id !== id)),
      moveRule: (id, offset) => {
        const next = [...rules];
        const from = next.findIndex((rule) => rule.id === id);
        const to = from + offset;
        const moving = next[from];
        const swapped = next[to];
        if (!moving || !swapped) return;
        next[from] = swapped;
        next[to] = moving;
        update(next);
      },
    };
  }, [rules, accountId, save]);
}
