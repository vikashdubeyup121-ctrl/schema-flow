import { QueryClient } from '@tanstack/react-query';
import { QUERY_CONFIG } from '@/config/query';
import { Logger } from '@/shared/services/logger.service';
import type { ApiClientError } from './types';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: QUERY_CONFIG.STALE_TIME_DEFAULT,
      gcTime: QUERY_CONFIG.GC_TIME,
      retry: (failureCount, error) => {
        const apiError = error as unknown as ApiClientError;
        if (apiError.status === 401 || apiError.status === 403 || apiError.status === 404) {
          return false;
        }
        return failureCount < QUERY_CONFIG.RETRY_COUNT;
      },
      retryDelay: QUERY_CONFIG.RETRY_DELAY_MS,
    },
    mutations: {
      onError: (error) => {
        Logger.error('Mutation failed', 'QueryClient', error);
      },
    },
  },
});
