import { useCallback } from 'react';
import { useCanvasHoverStore } from '../stores/canvasHover.store';
import { computeHoverHighlights } from '../services/hoverGraph.service';
import type { RelationshipEdgeData } from '../types/CanvasNode';
import type { Edge } from '@/lib/reactflow';

export function useCanvasHover(
  edges: Edge[],
): {
  onTableHover: (tableId: string) => void;
  onTableLeave: () => void;
} {
  const { setHovered, setHighlights, clearHover } = useCanvasHoverStore();

  const onTableHover = useCallback(
    (tableId: string) => {
      setHovered(tableId, 'table');
      const { connectedTableIds, connectedEdgeIds } = computeHoverHighlights(
        tableId,
        edges as unknown as Array<{ id: string; source: string; target: string; data?: RelationshipEdgeData }>,
      );
      setHighlights(connectedTableIds, connectedEdgeIds);
    },
    [edges, setHovered, setHighlights],
  );

  const onTableLeave = useCallback(() => {
    clearHover();
  }, [clearHover]);

  return { onTableHover, onTableLeave };
}
