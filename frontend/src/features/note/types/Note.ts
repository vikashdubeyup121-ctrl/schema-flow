import type { ReviewState } from '@/features/canvas/types/Canvas';
import type { Point } from '@/shared/types/Geometry';

export interface NoteData {
  id: string;
  title: string;
  color?: string | undefined;
  content: string;
  reviewState: ReviewState;
  position: Point;
  width: number;
  height: number;
}
