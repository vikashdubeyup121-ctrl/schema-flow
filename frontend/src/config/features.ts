export const Features = {
  collaborationEditing: true,
  collaborationCursors: false,
  review: true,
  sqlImport: false,
  commandPalette: false,
  mockAuth: true,
  mockData: true,
} as const;

export type FeatureKey = keyof typeof Features;
