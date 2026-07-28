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
    async (error) => {
      const originalRequest = error.config;
      
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          // Attempt to refresh
          const refreshRes = await axios.post(`${ENV.API_BASE_URL}/auth/refresh`, {}, {
            withCredentials: true
          });
          const newAccessToken = refreshRes.data.data.accessToken;
          localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, newAccessToken);
          
          if (originalRequest.headers) {
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          }
          return client(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          onForceLogout?.();
          return Promise.reject(parseApiError(refreshError as any));
        }
      }

      const parsed = parseApiError(error);
      return Promise.reject(parsed);
    },
  );

  return client;
}

export const apiClient = createApiClient();
