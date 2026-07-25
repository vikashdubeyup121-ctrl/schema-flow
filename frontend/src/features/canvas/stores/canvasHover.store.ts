import { create } from 'zustand';
import type { CanvasTargetType } from '../types/Canvas';

interface HoverState {
  hoveredId: string | null;
  hoveredType: CanvasTargetType | null;
  highlightedTableIds: Set<string>;
  highlightedEdgeIds: Set<string>;

  setHovered: (id: string, type: CanvasTargetType) => void;
  setHighlights: (tableIds: string[], edgeIds: string[]) => void;
  clearHover: () => void;
}

export const useCanvasHoverStore = create<HoverState>((set) => ({
  hoveredId: null,
  hoveredType: null,
  highlightedTableIds: new Set(),
  highlightedEdgeIds: new Set(),

  setHovered: (id, type) => set({ hoveredId: id, hoveredType: type }),

  setHighlights: (tableIds, edgeIds) =>
    set({
      highlightedTableIds: new Set(tableIds),
      highlightedEdgeIds: new Set(edgeIds),
    }),

  clearHover: () =>
    set({
      hoveredId: null,
      hoveredType: null,
      highlightedTableIds: new Set(),
      highlightedEdgeIds: new Set(),
    }),
}));
