import { memo, type ReactNode } from 'react';
import { getSmoothStepPath, EdgeLabelRenderer, type EdgeProps } from '@/lib/reactflow';
import type { RelationshipEdgeData } from '../../types/CanvasNode';
import { useCanvasHoverStore } from '../../stores/canvasHover.store';
import { REVIEW_STATE_COLORS } from '../../constants/canvas.constants';

function CardinalityMarker({
  cx,
  cy,
  type,
  isMany,
}: {
  cx: number;
  cy: number;
  type: 'source' | 'target';
  isMany: boolean;
}): ReactNode {
  const size = 10;
  const offset = type === 'source' ? -size : size;

  if (isMany) {
    // Crow's foot marker
    return (
      <g transform={`translate(${cx}, ${cy})`}>
        <line x1={offset} y1={-size / 2} x2={0} y2={0} stroke="currentColor" strokeWidth={1.5} />
        <line x1={offset} y1={size / 2} x2={0} y2={0} stroke="currentColor" strokeWidth={1.5} />
        <line x1={offset} y1={0} x2={0} y2={0} stroke="currentColor" strokeWidth={1.5} />
      </g>
    );
  }

  // Single bar marker
  return (
    <g transform={`translate(${cx}, ${cy})`}>
      <line x1={0} y1={-size / 2} x2={0} y2={size / 2} stroke="currentColor" strokeWidth={1.5} />
    </g>
  );
}

export const RelationshipEdge = memo(function RelationshipEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps & { data?: RelationshipEdgeData }): ReactNode {
  const highlightedEdgeIds = useCanvasHoverStore((s) => s.highlightedEdgeIds);
  const isHighlighted = highlightedEdgeIds.has(id);

  const reviewState = data?.reviewState ?? 'published';
  const reviewColor = REVIEW_STATE_COLORS[reviewState];
  const isDeleted = reviewState === 'deleted';

  const strokeColor = reviewState !== 'published' ? reviewColor : isHighlighted
    ? 'hsl(var(--selected))'
    : 'hsl(var(--muted-foreground))';

  const strokeWidth = isHighlighted ? 2 : 1.5;
  const strokeDasharray = isDeleted ? '6 3' : undefined;

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8,
  });

  const relationshipType = data?.relationshipType ?? 'ONE_TO_MANY';
  const isSourceMany = relationshipType === 'MANY_TO_ONE';
  const isTargetMany = relationshipType === 'ONE_TO_MANY';

  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;

  return (
    <>
      {/* Invisible wider path for easier selection */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={12}
        className="cursor-pointer"
      />

      {/* Visible edge */}
      <path
        d={edgePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        className="transition-colors duration-150"
        style={{ color: strokeColor }}
      />

      {/* Cardinality markers */}
      <g style={{ color: strokeColor }}>
        <CardinalityMarker cx={sourceX} cy={sourceY} type="source" isMany={isSourceMany} />
        <CardinalityMarker cx={targetX} cy={targetY} type="target" isMany={isTargetMany} />
      </g>

      {/* Relationship type label */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX ?? midX}px, ${labelY ?? midY}px)`,
            pointerEvents: 'none',
          }}
          className="text-[10px] text-muted-foreground bg-canvas px-1 rounded"
        >
          {relationshipType.replace('_', ':').replace('ONE', '1').replace('MANY', 'N')}
        </div>
      </EdgeLabelRenderer>
    </>
  );
});
