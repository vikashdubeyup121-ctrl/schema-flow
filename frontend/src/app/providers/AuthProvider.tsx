import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Features } from '@/config/features';
import { currentUserQueryOptions } from '@/features/auth/api/queries';
import { logout } from '@/features/auth/api/mutations';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { registerForceLogoutHandler } from '@/shared/api/apiClient';
import { MOCK_USER } from '@/features/auth/mock/mockUser';
import { STORAGE_KEYS } from '@/shared/constants/Storage';
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

function MockAuthProvider({ children }: AuthProviderProps): ReactNode {
  const value: AuthContextValue = {
    user: MOCK_USER,
    isLoading: false,
    isAuthenticated: true,
    logout: async () => {
      // no-op in mock mode
    },
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function RealAuthProvider({ children }: AuthProviderProps): ReactNode {
  const { data: user, isLoading } = useQuery({ ...currentUserQueryOptions });
  const { forceLogout, triggerForceLogout, resetForceLogout } = useAuthStore();

  useEffect(() => {
    registerForceLogoutHandler(triggerForceLogout);
  }, [triggerForceLogout]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      params.delete('token');
      const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : '');
      window.history.replaceState({}, '', newUrl);
      // Trigger a re-fetch since we now have a token
      window.location.reload(); // Simple way to force queryClient to re-run with new token
    }
  }, []);

  useEffect(() => {
    if (forceLogout) {
      resetForceLogout();
      void logout();
    }
  }, [forceLogout, resetForceLogout]);

  const value: AuthContextValue = {
    user: user ?? null,
    isLoading,
    isAuthenticated: user !== undefined,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }: AuthProviderProps): ReactNode {
  if (Features.mockAuth) {
    return <MockAuthProvider>{children}</MockAuthProvider>;
  }
  return <RealAuthProvider>{children}</RealAuthProvider>;
}
