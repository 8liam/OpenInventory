import type { ReactNode } from "react";

export type LensId = "dashboard" | "items" | "storage" | "cases" | "tradeup";

export type Lens = { id: LensId; label: string; caption: string };

export type LensGalleryProps = { lenses: readonly Lens[] } & Record<LensId, ReactNode>;
