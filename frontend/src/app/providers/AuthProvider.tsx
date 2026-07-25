import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { currentUserQueryOptions } from '@/features/auth/api/queries';
import { logout } from '@/features/auth/api/mutations';
import type { User } from '@/features/auth/types/User';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): ReactNode {
  const { data: user, isLoading } = useQuery({
    ...currentUserQueryOptions,
  });

  useEffect(() => {
    const handler = (): void => {
      void logout();
    };
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, []);

  const value: AuthContextValue = {
    user: user ?? null,
    isLoading,
    isAuthenticated: user !== undefined,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
