import { create } from 'zustand';
import { InteractionMode } from '../types/InteractionMode';
import type { CanvasTool, DragSession, ResizeSession } from '../types/Canvas';
import type { Point } from '@/shared/types/Geometry';

interface InteractionState {
  mode: InteractionMode;
  activeTool: CanvasTool;
  dragSession: DragSession | null;
  resizeSession: ResizeSession | null;

  setTool: (tool: CanvasTool) => void;
  setMode: (mode: InteractionMode) => void;

  startDrag: (ids: string[], startPosition: Point) => void;
  updateDrag: (currentPosition: Point) => void;
  endDrag: () => void;

  startResize: (tableId: string, startWidth: number, startX: number) => void;
  updateResize: (currentWidth: number) => void;
  endResize: () => void;
}

export const useCanvasInteractionStore = create<InteractionState>((set) => ({
  mode: InteractionMode.Idle,
  activeTool: 'pointer',
  dragSession: null,
  resizeSession: null,

  setTool: (tool) => set({ activeTool: tool }),
  setMode: (mode) => set({ mode }),

  startDrag: (ids, startPosition) =>
    set({
      mode: InteractionMode.Dragging,
      dragSession: {
        active: true,
        startPosition,
        currentPosition: startPosition,
        delta: { x: 0, y: 0 },
        draggedIds: ids,
      },
    }),

  updateDrag: (currentPosition) =>
    set((state) => {
      if (!state.dragSession) return state;
      return {
        dragSession: {
          ...state.dragSession,
          currentPosition,
          delta: {
            x: currentPosition.x - state.dragSession.startPosition.x,
            y: currentPosition.y - state.dragSession.startPosition.y,
          },
        },
      };
    }),

  endDrag: () => set({ mode: InteractionMode.Idle, dragSession: null }),

  startResize: (tableId, startWidth, startX) =>
    set({
      mode: InteractionMode.Resizing,
      resizeSession: {
        active: true,
        tableId,
        startWidth,
        currentWidth: startWidth,
        startX,
      },
    }),

  updateResize: (currentWidth) =>
    set((state) => {
      if (!state.resizeSession) return state;
      return {
        resizeSession: { ...state.resizeSession, currentWidth },
      };
    }),

  endResize: () => set({ mode: InteractionMode.Idle, resizeSession: null }),
}));
