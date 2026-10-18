import type { Slice } from "~/lib/items/dashboard.types";

export type StackedBarProps = { readonly slices: readonly Slice[]; readonly currency: string };
