import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';
import { ENV } from '@/config/env';
import { STORAGE_KEYS } from '@/shared/constants/Storage';
import { Logger } from '@/shared/services/logger.service';
import { parseApiError } from './errorHandler';

let onForceLogout: (() => void) | null = null;

export function registerForceLogoutHandler(handler: () => void): void {
  onForceLogout = handler;
}

function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: ENV.API_BASE_URL,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token && config.headers) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    Logger.debug(`${config.method?.toUpperCase()} ${config.url}`, 'ApiClient');
    return config;
  });

  client.interceptors.response.use(
    (response: AxiosResponse) => {
      Logger.debug(`${response.status} ${response.config.url}`, 'ApiClient');
      // Unwrap standard `{ success: true, data: T }` envelope
      if (response.data && response.data.success !== undefined) {
        if (response.data.success) {
          response.data = response.data.data;
        }
      }
      return response;
    },
    (error) => {
      const parsed = parseApiError(error);

      if (parsed.status === 401) {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        onForceLogout?.();
      }

      return Promise.reject(parsed);
    },
  );

  return client;
}

export const apiClient = createApiClient();
