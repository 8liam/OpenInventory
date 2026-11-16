import type { CtaConfig } from "./cta.types";

export const ctaConfig = {
  headline: "Ready to take control of your inventory?",
  description: "A little less searching. A lot more knowing what you own.",
  githubLabel: "Star on GitHub",
  availabilityLabel: "Available for",
  platforms: [
    { label: "macOS", icon: "apple" },
    { label: "Windows", icon: "windows" },
    { label: "Linux", icon: "linux" },
  ],
} as const satisfies CtaConfig;
