import type { Point } from '@/shared/types/Geometry';

export type ReviewState = 'published' | 'created' | 'modified' | 'deleted' | 'unchanged';

export type CanvasTool = 'pointer' | 'hand';

export type CanvasTargetType = 'canvas' | 'table' | 'relationship' | 'note' | 'column';

export type RelationshipType = 'ONE_TO_ONE' | 'ONE_TO_MANY' | 'MANY_TO_ONE';

export interface DragSession {
  active: boolean;
  startPosition: Point;
  currentPosition: Point;
  delta: Point;
  draggedIds: string[];
}

export interface ResizeSession {
  active: boolean;
  tableId: string;
  startWidth: number;
  currentWidth: number;
  startX: number;
}

export interface ContextMenuTarget {
  targetId: string | null;
  targetType: CanvasTargetType;
}
