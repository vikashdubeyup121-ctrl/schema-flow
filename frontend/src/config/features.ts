export const Features = {
  collaborationEditing: true,
  collaborationCursors: false,
  review: true,
  sqlImport: false,
  commandPalette: false,
  mockAuth: false,
  mockData: false,
} as const;

export type FeatureKey = keyof typeof Features;
