import { memo, type ReactNode } from 'react';
import { getSmoothStepPath, Position } from '@/lib/reactflow';

interface RelationshipPreviewProps {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
}

export const RelationshipPreview = memo(function RelationshipPreview({
  sourceX,
  sourceY,
  targetX,
  targetY,
}: RelationshipPreviewProps): ReactNode {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition: Position.Right,
    targetX,
    targetY,
    targetPosition: Position.Left,
    borderRadius: 8,
  });

  return (
    <path
      d={edgePath}
      fill="none"
      stroke="hsl(var(--primary))"
      strokeWidth={1.5}
      strokeDasharray="6 3"
      className="animate-pulse pointer-events-none"
    />
  );
});
