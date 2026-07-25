import { create } from 'zustand';
import type { Point } from '@/shared/types/Geometry';

export interface SnapLine {
  axis: 'x' | 'y';
  position: number;
}

export interface AlignmentGuide {
  axis: 'x' | 'y';
  position: number;
}

interface GuideState {
  snapLines: SnapLine[];
  alignmentGuides: AlignmentGuide[];
  dropPreviewPosition: Point | null;

  setSnapLines: (lines: SnapLine[]) => void;
  setAlignmentGuides: (guides: AlignmentGuide[]) => void;
  setDropPreview: (position: Point | null) => void;
  clearGuides: () => void;
}

export const useCanvasGuideStore = create<GuideState>((set) => ({
  snapLines: [],
  alignmentGuides: [],
  dropPreviewPosition: null,

  setSnapLines: (lines) => set({ snapLines: lines }),
  setAlignmentGuides: (guides) => set({ alignmentGuides: guides }),
  setDropPreview: (position) => set({ dropPreviewPosition: position }),

  clearGuides: () =>
    set({
      snapLines: [],
      alignmentGuides: [],
      dropPreviewPosition: null,
    }),
}));
