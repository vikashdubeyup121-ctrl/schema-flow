import type { Point, Size, Rectangle, Bounds } from '@/shared/types/Geometry';

export function getRectangleBounds(rect: Rectangle): Bounds {
  return {
    minX: rect.x,
    minY: rect.y,
    maxX: rect.x + rect.width,
    maxY: rect.y + rect.height,
  };
}

export function mergeBounds(a: Bounds, b: Bounds): Bounds {
  return {
    minX: Math.min(a.minX, b.minX),
    minY: Math.min(a.minY, b.minY),
    maxX: Math.max(a.maxX, b.maxX),
    maxY: Math.max(a.maxY, b.maxY),
  };
}

export function boundsToRectangle(bounds: Bounds): Rectangle {
  return {
    x: bounds.minX,
    y: bounds.minY,
    width: bounds.maxX - bounds.minX,
    height: bounds.maxY - bounds.minY,
  };
}

export function rectanglesIntersect(a: Rectangle, b: Rectangle): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function pointInsideRectangle(point: Point, rect: Rectangle): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

export function distanceBetweenPoints(a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function getRectangleCenter(rect: Rectangle): Point {
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2,
  };
}

export function getBoundsCenter(bounds: Bounds): Point {
  return {
    x: (bounds.minX + bounds.maxX) / 2,
    y: (bounds.minY + bounds.maxY) / 2,
  };
}

export function getEdgeAnchorPoints(rect: Rectangle): {
  top: Point;
  bottom: Point;
  left: Point;
  right: Point;
} {
  const cx = rect.x + rect.width / 2;
  const cy = rect.y + rect.height / 2;
  return {
    top: { x: cx, y: rect.y },
    bottom: { x: cx, y: rect.y + rect.height },
    left: { x: rect.x, y: cy },
    right: { x: rect.x + rect.width, y: cy },
  };
}

export function getTableBounds(position: Point, size: Size): Bounds {
  return {
    minX: position.x,
    minY: position.y,
    maxX: position.x + size.width,
    maxY: position.y + size.height,
  };
}

export function mergeAllBounds(bounds: Bounds[]): Bounds | null {
  if (bounds.length === 0) return null;
  return bounds.reduce((acc, b) => mergeBounds(acc, b));
}
