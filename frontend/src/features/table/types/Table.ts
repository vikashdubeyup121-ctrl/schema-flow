import type { ReviewState } from '@/features/canvas/types/Canvas';
import type { Point } from '@/shared/types/Geometry';

export interface TableData {
  id: string;
  name: string;
  color: string;
  collapsed: boolean;
  position: Point;
  width: number;
  reviewState: ReviewState;
  columnIds: string[];
}
