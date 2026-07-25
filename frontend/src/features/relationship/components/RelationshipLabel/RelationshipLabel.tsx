import { memo, type ReactNode } from 'react';
import { EdgeLabelRenderer } from '@/lib/reactflow';
import type { RelationshipType } from '@/features/canvas/types/Canvas';

interface RelationshipLabelProps {
  relationshipType: RelationshipType;
  x: number;
  y: number;
}

function formatRelationshipType(type: RelationshipType): string {
  return type.replace('_', ':').replace('ONE', '1').replace('MANY', 'N');
}

export const RelationshipLabel = memo(function RelationshipLabel({
  relationshipType,
  x,
  y,
}: RelationshipLabelProps): ReactNode {
  return (
    <EdgeLabelRenderer>
      <div
        style={{
          position: 'absolute',
          transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
          pointerEvents: 'none',
        }}
        className="text-[10px] text-muted-foreground bg-canvas px-1 rounded"
      >
        {formatRelationshipType(relationshipType)}
      </div>
    </EdgeLabelRenderer>
  );
});
