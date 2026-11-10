import type { PluralForms } from "../../utils/plural.types.ts";

export const OPENING_NOUN = { one: "opening", other: "openings" } as const satisfies PluralForms;
