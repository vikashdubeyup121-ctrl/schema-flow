import { apiClient } from '@/shared/api/apiClient';
import { queryClient } from '@/shared/api/queryClient';
import { STORAGE_KEYS } from '@/shared/constants/Storage';
import type { AuthResponse, LoginWithGoogleRequest } from '../types/AuthDTO';
import { mapAuthResponseToUser } from './mapper';
import { authKeys } from './keys';
import type { User } from '../types/User';

export async function loginWithGoogle(request: LoginWithGoogleRequest): Promise<User> {
  const response = await apiClient.post<AuthResponse>('/auth/google', request);
  const user = mapAuthResponseToUser(response.data);
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.data.accessToken);
  queryClient.setQueryData(authKeys.currentUser(), user);
  return user;
}

export async function logout(): Promise<void> {
  try {
    const hasToken = !!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (hasToken) {
      await apiClient.post('/auth/logout').catch(() => {});
    }
  } finally {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    queryClient.clear();
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }
}
