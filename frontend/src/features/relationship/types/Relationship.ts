import type { ReviewState, RelationshipType } from '@/features/canvas/types/Canvas';

export interface RelationshipData {
  id: string;
  sourceTableId: string;
  sourceColumnId: string;
  targetTableId: string;
  targetColumnId: string;
  relationshipType: RelationshipType;
  reviewState: ReviewState;
}
