import { CANVAS } from '../constants/canvas.constants';

export function clampZoom(zoom: number): number {
  return Math.min(Math.max(zoom, CANVAS.MIN_ZOOM), CANVAS.MAX_ZOOM);
}

export function formatZoomLabel(zoom: number): string {
  return `${Math.round(zoom * 100)}%`;
}
