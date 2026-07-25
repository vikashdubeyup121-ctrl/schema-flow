import { create } from 'zustand';
import type { UUID } from '@/shared/types/Common';

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastEntry {
  id: UUID;
  message: string;
  variant: ToastVariant;
  durationMs: number;
}

interface ToastState {
  toasts: ToastEntry[];
  show: (message: string, variant: ToastVariant, durationMs?: number) => void;
  dismiss: (id: UUID) => void;
  dismissAll: () => void;
}

const MAX_TOASTS = 3;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  show: (message, variant, durationMs = 4000) => {
    const id = crypto.randomUUID();
    set((state) => ({
      toasts: [
        ...state.toasts.slice(-(MAX_TOASTS - 1)),
        { id, message, variant, durationMs },
      ],
    }));
  },
  dismiss: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  dismissAll: () => set({ toasts: [] }),
}));

export const Toast = {
  success: (message: string, durationMs?: number) =>
    useToastStore.getState().show(message, 'success', durationMs),
  error: (message: string, durationMs?: number) =>
    useToastStore.getState().show(message, 'error', durationMs),
  warning: (message: string, durationMs?: number) =>
    useToastStore.getState().show(message, 'warning', durationMs),
  info: (message: string, durationMs?: number) =>
    useToastStore.getState().show(message, 'info', durationMs),
} as const;
