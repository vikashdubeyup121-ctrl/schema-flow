import { queryOptions } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/apiClient';
import type { AuthResponse } from '../types/AuthDTO';
import { mapAuthResponseToUser } from './mapper';
import { authKeys } from './keys';
import type { User } from '../types/User';

async function fetchCurrentUser(): Promise<User> {
  const response = await apiClient.get<AuthResponse>('/auth/me');
  return mapAuthResponseToUser(response.data);
}

export const currentUserQueryOptions = queryOptions({
  queryKey: authKeys.currentUser(),
  queryFn: fetchCurrentUser,
  retry: false,
  staleTime: Infinity,
});
