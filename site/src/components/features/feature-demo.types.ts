import type { ReactNode } from "react";
import type { FEATURE_DEMO_VARIANT } from "./feature-demo.config";

export type FeatureDemoVariant = (typeof FEATURE_DEMO_VARIANT)[keyof typeof FEATURE_DEMO_VARIANT];

/** Props every demo may receive; demos that look the same in both places ignore them. */
export type FeatureDemoComponentProps = { readonly variant?: FeatureDemoVariant };

export type FeatureDemoProps = {
  id: string;
  Demo: (props: FeatureDemoComponentProps) => ReactNode;
};
