import type { Point } from '@/shared/types/Geometry';
import { pointInsideRectangle } from './geometry.service';
import { CANVAS } from '../constants/canvas.constants';
import type { CanvasTargetType } from '../types/Canvas';

export interface HitTestTarget {
  type: CanvasTargetType;
  id: string;
}

export interface HittableObject {
  id: string;
  type: CanvasTargetType;
  x: number;
  y: number;
  width: number;
  height: number;
}

export function hitTest(
  worldPoint: Point,
  objects: HittableObject[],
): HitTestTarget | null {
  for (const obj of objects) {
    if (
      pointInsideRectangle(worldPoint, {
        x: obj.x,
        y: obj.y,
        width: obj.width,
        height: obj.height,
      })
    ) {
      return { type: obj.type, id: obj.id };
    }
  }
  return null;
}

export function hitTestHandle(
  worldPoint: Point,
  handleCenter: Point,
): boolean {
  const halfSize = CANVAS.CONNECTION_HANDLE_SIZE / 2;
  return pointInsideRectangle(worldPoint, {
    x: handleCenter.x - halfSize,
    y: handleCenter.y - halfSize,
    width: CANVAS.CONNECTION_HANDLE_SIZE,
    height: CANVAS.CONNECTION_HANDLE_SIZE,
  });
}
