export const CANVAS = {
  MIN_ZOOM: 0.1,
  MAX_ZOOM: 2.0,
  DEFAULT_ZOOM: 1.0,
  GRID_SIZE: 20,
  DRAG_THRESHOLD_PX: 5,
  TABLE_MIN_WIDTH: 200,
  TABLE_MAX_WIDTH: 600,
  TABLE_DEFAULT_WIDTH: 240,
  TABLE_HEADER_HEIGHT: 40,
  TABLE_ROW_HEIGHT: 32,
  NOTE_MIN_WIDTH: 160,
  NOTE_MIN_HEIGHT: 100,
  NOTE_MAX_WIDTH: 600,
  NOTE_MAX_HEIGHT: 800,
  NOTE_DEFAULT_WIDTH: 240,
  NOTE_DEFAULT_HEIGHT: 160,
  CONNECTION_HANDLE_SIZE: 10,
  SNAP_DISTANCE: 8,
  SELECTION_COLOR: 'hsl(var(--primary))',
  DOUBLE_CLICK_DELAY: 300,
} as const;

export const TABLE_COLORS = [
  '#4f46e5',
  '#0891b2',
  '#059669',
  '#d97706',
  '#dc2626',
  '#7c3aed',
  '#db2777',
  '#475569',
] as const;

export type TableColor = (typeof TABLE_COLORS)[number];

export const REVIEW_STATE_COLORS = {
  published: 'hsl(var(--border))',
  unchanged: 'transparent',
  created: '#16a34a',
  modified: '#d97706',
  deleted: '#dc2626',
} as const;
