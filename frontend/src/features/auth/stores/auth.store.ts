import { create } from 'zustand';
import type { User } from '../types/User';

interface AuthState {
  forceLogout: boolean;
  triggerForceLogout: () => void;
  resetForceLogout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  forceLogout: false,
  triggerForceLogout: () => set({ forceLogout: true }),
  resetForceLogout: () => set({ forceLogout: false }),
}));

export type { User };
