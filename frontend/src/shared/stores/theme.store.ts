import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Theme } from '@/config/theme';
import { STORAGE_KEYS } from '@/shared/constants/Storage';

interface ThemeState {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark',
      resolvedTheme: 'dark',
      setTheme: (theme: Theme) => {
        const resolved = resolveTheme(theme);
        document.documentElement.setAttribute('data-theme', resolved);
        set({ theme, resolvedTheme: resolved });
      },
    }),
    {
      name: STORAGE_KEYS.THEME,
      partialize: (state) => ({ theme: state.theme }),
    },
  ),
);
