import { create } from 'zustand';

interface DiagramState {
  activeDiagramId: string | null;
  setActiveDiagram: (id: string | null) => void;
}

export const useDiagramStore = create<DiagramState>((set) => ({
  activeDiagramId: null,
  setActiveDiagram: (id) => set({ activeDiagramId: id }),
}));
