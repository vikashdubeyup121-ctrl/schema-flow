import type { Point } from '@/shared/types/Geometry';
import { snapToGrid } from './snapEngine.service';

export interface DragResult {
  position: Point;
  delta: Point;
}

export function computeDragPosition(
  originalPosition: Point,
  startPointer: Point,
  currentPointer: Point,
  snapEnabled: boolean,
): DragResult {
  const delta: Point = {
    x: currentPointer.x - startPointer.x,
    y: currentPointer.y - startPointer.y,
  };

  const rawPosition: Point = {
    x: originalPosition.x + delta.x,
    y: originalPosition.y + delta.y,
  };

  const position = snapEnabled ? snapToGrid(rawPosition) : rawPosition;

  return { position, delta };
}

export function exceedsDragThreshold(
  startPointer: Point,
  currentPointer: Point,
  threshold: number,
): boolean {
  const dx = Math.abs(currentPointer.x - startPointer.x);
  const dy = Math.abs(currentPointer.y - startPointer.y);
  return dx > threshold || dy > threshold;
}
