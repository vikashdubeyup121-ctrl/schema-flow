import { useEffect, type ReactNode } from 'react';
import { useThemeStore } from '@/shared/stores/theme.store';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps): ReactNode {
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    setTheme(theme);

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (): void => setTheme('system');
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [theme, setTheme]);

  return children;
}
