function requireEnv(key: string): string {
  const value = import.meta.env[key];
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value as string;
}

function optionalEnv(key: string, fallback: string): string {
  const value = import.meta.env[key];
  return typeof value === 'string' && value !== '' ? value : fallback;
}

export const ENV = {
  API_BASE_URL: optionalEnv('VITE_API_BASE_URL', 'http://localhost:3000/api/v1'),
  GOOGLE_CLIENT_ID: optionalEnv('VITE_GOOGLE_CLIENT_ID', ''),
  IS_PRODUCTION: import.meta.env.PROD,
  IS_DEVELOPMENT: import.meta.env.DEV,
} as const;

export { requireEnv, optionalEnv };
