import { create } from 'zustand';
import type { CanvasTargetType } from '../types/Canvas';

interface ContextMenuState {
  open: boolean;
  x: number;
  y: number;
  targetId: string | null;
  targetType: CanvasTargetType;

  openMenu: (x: number, y: number, targetType: CanvasTargetType, targetId?: string) => void;
  closeMenu: () => void;
}

export const useCanvasContextMenuStore = create<ContextMenuState>((set) => ({
  open: false,
  x: 0,
  y: 0,
  targetId: null,
  targetType: 'canvas',

  openMenu: (x, y, targetType, targetId?) =>
    set({ open: true, x, y, targetType, targetId: targetId ?? null }),

  closeMenu: () => set({ open: false, targetId: null }),
}));
