/**
 * Which of the app's palettes paints the embedded demos. The landing page is dark only, so the
 * demos use the app's default palette in its dark variant.
 */
export const APP_TOKENS = {
  selector: ".oi-app",
  palette: "default",
  scheme: "dark",
  chartPrefix: "chart",
  wearPrefix: "wear",
} as const;
