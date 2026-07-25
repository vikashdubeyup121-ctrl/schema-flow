import { create } from 'zustand';
import type { CanvasTargetType } from '../types/Canvas';

interface ClipboardItem {
  type: CanvasTargetType;
  payload: unknown;
}

interface ClipboardState {
  item: ClipboardItem | null;
  copy: (type: CanvasTargetType, payload: unknown) => void;
  clear: () => void;
  hasItem: () => boolean;
}

export const useCanvasClipboardStore = create<ClipboardState>((set, get) => ({
  item: null,

  copy: (type, payload) => set({ item: { type, payload } }),
  clear: () => set({ item: null }),
  hasItem: () => get().item !== null,
}));
