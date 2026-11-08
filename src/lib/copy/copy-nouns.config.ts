import type { PluralForms } from "../../utils/plural.types.ts";

export const PULL_NOUN = { one: "pull", other: "pulls" } as const satisfies PluralForms;
export const OPENING_NOUN = { one: "opening", other: "openings" } as const satisfies PluralForms;
