export const Features = {
  collaboration: true,
  review: true,
  sqlImport: false,
  commandPalette: false,
} as const;

export type FeatureKey = keyof typeof Features;
