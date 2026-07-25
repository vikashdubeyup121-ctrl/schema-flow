import type { CanvasTargetType } from '../types/Canvas';
import type { TableNodeData, NoteNodeData } from '../types/CanvasNode';

export interface ClipboardPayload {
  type: CanvasTargetType;
  data: TableNodeData | NoteNodeData | Record<string, unknown>;
}

export function serializeTableForClipboard(data: TableNodeData): ClipboardPayload {
  return {
    type: 'table',
    data: { ...data },
  };
}

export function serializeNoteForClipboard(data: NoteNodeData): ClipboardPayload {
  return {
    type: 'note',
    data: { ...data },
  };
}

export function deserializeClipboardPayload(payload: ClipboardPayload): ClipboardPayload {
  return { ...payload };
}
