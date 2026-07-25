export interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  timeout?: number;
}

export interface ApiClientError {
  message: string;
  code: string;
  status: number;
  details?: unknown;
}
