import { create } from 'zustand';
import type { UUID } from '@/shared/types/Common';

interface DialogConfig {
  id: UUID;
  component: string;
  props: Record<string, unknown> | undefined;
}

interface DialogState {
  activeDialog: DialogConfig | null;
  open: (component: string, props?: Record<string, unknown>) => void;
  close: () => void;
}

export const useDialogStore = create<DialogState>((set) => ({
  activeDialog: null,
  open: (component, props) =>
    set({ activeDialog: { id: crypto.randomUUID(), component, props } }),
  close: () => set({ activeDialog: null }),
}));
