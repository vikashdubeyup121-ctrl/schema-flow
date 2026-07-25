import { create } from 'zustand';
import type { Viewport } from '@/lib/reactflow';
import { CANVAS } from '../constants/canvas.constants';

interface ViewportState {
  viewport: Viewport;
  setViewport: (viewport: Viewport) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
}

export const useCanvasViewportStore = create<ViewportState>((set) => ({
  viewport: { x: 0, y: 0, zoom: CANVAS.DEFAULT_ZOOM },

  setViewport: (viewport) => set({ viewport }),

  zoomIn: () =>
    set((state) => ({
      viewport: {
        ...state.viewport,
        zoom: Math.min(state.viewport.zoom + 0.1, CANVAS.MAX_ZOOM),
      },
    })),

  zoomOut: () =>
    set((state) => ({
      viewport: {
        ...state.viewport,
        zoom: Math.max(state.viewport.zoom - 0.1, CANVAS.MIN_ZOOM),
      },
    })),

  resetZoom: () =>
    set((state) => ({
      viewport: { ...state.viewport, zoom: CANVAS.DEFAULT_ZOOM },
    })),
}));
