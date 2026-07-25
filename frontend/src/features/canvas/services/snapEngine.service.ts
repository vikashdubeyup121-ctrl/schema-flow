import { CANVAS } from '../constants/canvas.constants';
import type { Point } from '@/shared/types/Geometry';

export function snapToGrid(point: Point, gridSize: number = CANVAS.GRID_SIZE): Point {
  return {
    x: Math.round(point.x / gridSize) * gridSize,
    y: Math.round(point.y / gridSize) * gridSize,
  };
}

export function snapWidthToGrid(width: number, gridSize: number = CANVAS.GRID_SIZE): number {
  return Math.round(width / gridSize) * gridSize;
}

export function clampTableWidth(width: number): number {
  return Math.min(Math.max(width, CANVAS.TABLE_MIN_WIDTH), CANVAS.TABLE_MAX_WIDTH);
}
