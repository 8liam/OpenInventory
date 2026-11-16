import type { ICON_PATHS } from '../../lib/download/download.icons';

export interface CtaConfig {
  readonly headline: string;
  readonly description: string;
  readonly githubLabel: string;
  readonly availabilityLabel: string;
  readonly platforms: readonly {
    readonly label: string;
    readonly icon: keyof typeof ICON_PATHS;
  }[];
}
