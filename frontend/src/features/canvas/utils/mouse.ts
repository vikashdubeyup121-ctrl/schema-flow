import type { Point } from '@/shared/types/Geometry';

export function getEventPoint(event: PointerEvent | MouseEvent): Point {
  return { x: event.clientX, y: event.clientY };
}

export function isLeftButton(event: PointerEvent | MouseEvent): boolean {
  return event.button === 0;
}

export function isMiddleButton(event: PointerEvent | MouseEvent): boolean {
  return event.button === 1;
}

export function isRightButton(event: PointerEvent | MouseEvent): boolean {
  return event.button === 2;
}
