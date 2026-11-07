import type { OrganiserRule } from "~/lib/organiser/organiser.types";
import type { StorageUnit } from "~/lib/storage/storage.types";

export type OrganiserRuleFormProps = {
  readonly units: readonly StorageUnit[];
  /** Known values per condition kind, offered as suggestions while typing. */
  readonly suggestions: Readonly<
    Record<"category" | "rarity" | "collection" | "name", readonly string[]>
  >;
  readonly onAdd: (rule: OrganiserRule) => void;
};
