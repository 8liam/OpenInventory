import type { AccentId } from "~/lib/theme/theme.types";

export type AccentPickerProps = {
  readonly value: AccentId;
  readonly onChange: (id: AccentId) => void;
  readonly ariaLabel: string;
  readonly labels: Readonly<Record<AccentId, string>>;
};
