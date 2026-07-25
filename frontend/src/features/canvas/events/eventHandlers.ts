import { canvasEventBus } from './eventBus';
import { CanvasEventType } from './eventTypes';
import type { Point } from '@/shared/types/Geometry';

export function publishTableMoved(tableId: string, position: Point): void {
  canvasEventBus.publish(CanvasEventType.TABLE_MOVED, { tableId, position });
}

export function publishTableCreated(tableId: string): void {
  canvasEventBus.publish(CanvasEventType.TABLE_CREATED, { tableId });
}

export function publishTableDeleted(tableId: string): void {
  canvasEventBus.publish(CanvasEventType.TABLE_DELETED, { tableId });
}

export function publishTableResized(tableId: string, width: number): void {
  canvasEventBus.publish(CanvasEventType.TABLE_RESIZED, { tableId, width });
}

export function publishRelationshipCreated(relationshipId: string): void {
  canvasEventBus.publish(CanvasEventType.RELATIONSHIP_CREATED, { relationshipId });
}

export function publishRelationshipDeleted(relationshipId: string): void {
  canvasEventBus.publish(CanvasEventType.RELATIONSHIP_DELETED, { relationshipId });
}

export function publishNoteCreated(noteId: string): void {
  canvasEventBus.publish(CanvasEventType.NOTE_CREATED, { noteId });
}

export function publishNoteMoved(noteId: string, position: Point): void {
  canvasEventBus.publish(CanvasEventType.NOTE_MOVED, { noteId, position });
}

export function publishViewportChanged(x: number, y: number, zoom: number): void {
  canvasEventBus.publish(CanvasEventType.VIEWPORT_CHANGED, { x, y, zoom });
}
