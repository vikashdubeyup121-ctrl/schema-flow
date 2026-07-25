import type { RelationshipEdgeData } from '../types/CanvasNode';

interface HoverHighlights {
  connectedTableIds: string[];
  connectedEdgeIds: string[];
}

export function computeHoverHighlights(
  hoveredTableId: string,
  edges: Array<{ id: string; source: string; target: string; data?: RelationshipEdgeData }>,
): HoverHighlights {
  const connectedTableIds: string[] = [];
  const connectedEdgeIds: string[] = [];

  for (const edge of edges) {
    if (edge.source === hoveredTableId || edge.target === hoveredTableId) {
      connectedEdgeIds.push(edge.id);
      const otherId = edge.source === hoveredTableId ? edge.target : edge.source;
      if (!connectedTableIds.includes(otherId)) {
        connectedTableIds.push(otherId);
      }
    }
  }

  return { connectedTableIds, connectedEdgeIds };
}
