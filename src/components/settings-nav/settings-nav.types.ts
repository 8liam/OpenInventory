import type { LucideIcon } from "lucide-react";

export type SettingsNavItem<T extends string> = {
  readonly id: T;
  readonly label: string;
  readonly icon: LucideIcon;
};

export type SettingsNavProps<T extends string> = {
  readonly items: readonly SettingsNavItem<T>[];
  readonly value: T;
  readonly onChange: (id: T) => void;
  readonly ariaLabel: string;
};
