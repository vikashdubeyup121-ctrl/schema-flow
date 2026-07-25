import type { AxiosError } from 'axios';
import type { ApiClientError } from './types';
import { Logger } from '@/shared/services/logger.service';

interface BackendErrorBody {
  message?: string;
  code?: string;
}

export function parseApiError(error: AxiosError): ApiClientError {
  const status = error.response?.status ?? 0;
  const body = error.response?.data as BackendErrorBody | undefined;

  const message = body?.message ?? error.message ?? 'An unexpected error occurred';
  const code = body?.code ?? `HTTP_${status}`;

  Logger.error(`API Error [${status}]: ${message}`, 'ApiClient', { code, status });

  return { message, code, status };
}

export function friendlyMessage(error: ApiClientError): string {
  switch (error.status) {
    case 400:
      return error.message;
    case 401:
      return 'Your session has expired. Please log in again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return error.message;
    case 422:
      return error.message;
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
    case 502:
    case 503:
      return 'A server error occurred. Please try again later.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}
