import type { ReviewState } from '@/features/canvas/types/Canvas';
import type { Point } from '@/shared/types/Geometry';

export interface NoteData {
  id: string;
  content: string;
  reviewState: ReviewState;
  position: Point;
  width: number;
  height: number;
}
