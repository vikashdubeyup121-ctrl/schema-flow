import { CANVAS } from '../constants/canvas.constants';

export const ZOOM_LEVELS = [0.2, 0.25, 0.33, 0.5, 0.67, 0.75, 1.0, 1.25, 1.5, 2.0, 3.0] as const;

export function getNextZoomLevel(current: number): number {
  const next = ZOOM_LEVELS.find((z) => z > current);
  return next ?? CANVAS.MAX_ZOOM;
}

export function getPrevZoomLevel(current: number): number {
  const prev = [...ZOOM_LEVELS].reverse().find((z) => z < current);
  return prev ?? CANVAS.MIN_ZOOM;
}

export function formatZoomPercent(zoom: number): string {
  return `${Math.round(zoom * 100)}%`;
}
