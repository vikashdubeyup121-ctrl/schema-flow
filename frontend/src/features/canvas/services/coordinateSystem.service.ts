import type { Viewport } from '@/lib/reactflow';
import type { Point } from '@/shared/types/Geometry';

export function screenToFlow(screenPoint: Point, viewport: Viewport): Point {
  return {
    x: (screenPoint.x - viewport.x) / viewport.zoom,
    y: (screenPoint.y - viewport.y) / viewport.zoom,
  };
}

export function flowToScreen(flowPoint: Point, viewport: Viewport): Point {
  return {
    x: flowPoint.x * viewport.zoom + viewport.x,
    y: flowPoint.y * viewport.zoom + viewport.y,
  };
}

export function getCanvasCenter(
  canvasWidth: number,
  canvasHeight: number,
  viewport: Viewport,
): Point {
  return screenToFlow(
    { x: canvasWidth / 2, y: canvasHeight / 2 },
    viewport,
  );
}
