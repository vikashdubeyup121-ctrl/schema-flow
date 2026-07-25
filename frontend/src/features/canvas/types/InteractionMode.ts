export const InteractionMode = {
  Idle: 'idle',
  Dragging: 'dragging',
  Resizing: 'resizing',
  Connecting: 'connecting',
  Selecting: 'selecting',
  Panning: 'panning',
  Editing: 'editing',
} as const;

// eslint-disable-next-line no-redeclare
export type InteractionMode = (typeof InteractionMode)[keyof typeof InteractionMode];
