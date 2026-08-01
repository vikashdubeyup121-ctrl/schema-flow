import type { ReviewState, RelationshipType } from './Canvas';

export type ColumnDataType =
  | 'INT'
  | 'BIGINT'
  | 'SMALLINT'
  | 'DECIMAL'
  | 'FLOAT'
  | 'DOUBLE'
  | 'VARCHAR'
  | 'TEXT'
  | 'CHAR'
  | 'BOOLEAN'
  | 'DATE'
  | 'TIMESTAMP'
  | 'TIMESTAMPTZ'
  | 'UUID'
  | 'JSON'
  | 'JSONB'
  | 'BYTEA'
  | 'SERIAL'
  | 'BIGSERIAL';

export interface CanvasColumn {
  id: string;
  name: string;
  dataType: ColumnDataType;
  nullable: boolean;
  primaryKey: boolean;
  foreignKey: boolean;
  unique: boolean;
  defaultValue: string | null;
  note: string | null;
  reviewState: ReviewState;
  position: number;
}

export interface TableNodeData extends Record<string, unknown> {
  tableId: string;
  name: string;
  color: string;
  collapsed: boolean;
  reviewState: ReviewState;
  columns: CanvasColumn[];
}

export interface NoteNodeData extends Record<string, unknown> {
  noteId: string;
  title: string;
  color?: string | undefined;
  content: string;
  reviewState: ReviewState;
  width: number;
  height: number;
}

export interface RelationshipEdgeData extends Record<string, unknown> {
  relationshipId: string;
  relationshipType: RelationshipType;
  sourceColumnId: string;
  targetColumnId: string;
  reviewState: ReviewState;
}
