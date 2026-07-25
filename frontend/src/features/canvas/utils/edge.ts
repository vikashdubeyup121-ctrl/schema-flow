import type { Point } from '@/shared/types/Geometry';

export type EdgeDirection = 'horizontal' | 'vertical';

export function getMidpoint(a: Point, b: Point): Point {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  };
}

export function getNearestEdgeAnchor(
  sourceCenter: Point,
  targetCenter: Point,
): { sourceAnchor: 'left' | 'right'; targetAnchor: 'left' | 'right' } {
  if (targetCenter.x >= sourceCenter.x) {
    return { sourceAnchor: 'right', targetAnchor: 'left' };
  }
  return { sourceAnchor: 'left', targetAnchor: 'right' };
}

export function getEdgeDirection(source: Point, target: Point): EdgeDirection {
  const dx = Math.abs(target.x - source.x);
  const dy = Math.abs(target.y - source.y);
  return dx >= dy ? 'horizontal' : 'vertical';
}
