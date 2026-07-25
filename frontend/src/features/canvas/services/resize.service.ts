import { CANVAS } from '../constants/canvas.constants';
import { snapWidthToGrid, clampTableWidth } from './snapEngine.service';

export interface ResizeResult {
  width: number;
}

export function computeResizeWidth(
  startWidth: number,
  startX: number,
  currentX: number,
  snapEnabled: boolean,
): ResizeResult {
  const delta = currentX - startX;
  const rawWidth = startWidth + delta;
  const width = snapEnabled
    ? clampTableWidth(snapWidthToGrid(rawWidth))
    : clampTableWidth(rawWidth);

  return { width };
}

export function isWithinResizeBounds(width: number): boolean {
  return width >= CANVAS.TABLE_MIN_WIDTH && width <= CANVAS.TABLE_MAX_WIDTH;
}

export function clampResizeWidth(width: number): number {
  return Math.min(Math.max(width, CANVAS.TABLE_MIN_WIDTH), CANVAS.TABLE_MAX_WIDTH);
}
