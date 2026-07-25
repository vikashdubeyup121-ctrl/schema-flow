import type { Point, Rectangle, Bounds } from '@/shared/types/Geometry';
import type { Viewport } from '@/lib/reactflow';
import { CANVAS } from '../constants/canvas.constants';
import { getBoundsCenter } from './geometry.service';

export interface FitViewParams {
  bounds: Bounds;
  canvasWidth: number;
  canvasHeight: number;
  padding?: number;
}

export function screenToWorld(screenPoint: Point, viewport: Viewport): Point {
  return {
    x: (screenPoint.x - viewport.x) / viewport.zoom,
    y: (screenPoint.y - viewport.y) / viewport.zoom,
  };
}

export function worldToScreen(worldPoint: Point, viewport: Viewport): Point {
  return {
    x: worldPoint.x * viewport.zoom + viewport.x,
    y: worldPoint.y * viewport.zoom + viewport.y,
  };
}

export function computeFitViewport(params: FitViewParams): Viewport {
  const padding = params.padding ?? 40;
  const { bounds, canvasWidth, canvasHeight } = params;

  const boundsWidth = bounds.maxX - bounds.minX;
  const boundsHeight = bounds.maxY - bounds.minY;

  if (boundsWidth === 0 || boundsHeight === 0) {
    return { x: 0, y: 0, zoom: CANVAS.DEFAULT_ZOOM };
  }

  const scaleX = (canvasWidth - padding * 2) / boundsWidth;
  const scaleY = (canvasHeight - padding * 2) / boundsHeight;
  const zoom = Math.min(scaleX, scaleY, CANVAS.MAX_ZOOM);
  const clampedZoom = Math.max(zoom, CANVAS.MIN_ZOOM);

  const center = getBoundsCenter(bounds);
  const x = canvasWidth / 2 - center.x * clampedZoom;
  const y = canvasHeight / 2 - center.y * clampedZoom;

  return { x, y, zoom: clampedZoom };
}

export function computeCenterViewport(
  worldTarget: Point,
  canvasWidth: number,
  canvasHeight: number,
  zoom: number,
): Viewport {
  return {
    x: canvasWidth / 2 - worldTarget.x * zoom,
    y: canvasHeight / 2 - worldTarget.y * zoom,
    zoom,
  };
}

export function clampZoom(zoom: number): number {
  return Math.min(Math.max(zoom, CANVAS.MIN_ZOOM), CANVAS.MAX_ZOOM);
}

export function computeZoomAroundPoint(
  currentViewport: Viewport,
  targetZoom: number,
  pivotScreen: Point,
): Viewport {
  const clampedZoom = clampZoom(targetZoom);
  const scaleFactor = clampedZoom / currentViewport.zoom;

  return {
    x: pivotScreen.x - (pivotScreen.x - currentViewport.x) * scaleFactor,
    y: pivotScreen.y - (pivotScreen.y - currentViewport.y) * scaleFactor,
    zoom: clampedZoom,
  };
}

export function getVisibleWorldBounds(
  canvasWidth: number,
  canvasHeight: number,
  viewport: Viewport,
): Rectangle {
  const topLeft = screenToWorld({ x: 0, y: 0 }, viewport);
  const bottomRight = screenToWorld({ x: canvasWidth, y: canvasHeight }, viewport);
  return {
    x: topLeft.x,
    y: topLeft.y,
    width: bottomRight.x - topLeft.x,
    height: bottomRight.y - topLeft.y,
  };
}
