import type { ReviewState } from '@/features/canvas/types/Canvas';
import type { ColumnDataType } from '@/features/canvas/types/CanvasNode';

export interface ColumnData {
  id: string;
  tableId: string;
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
