import { ENV } from '@/config/env';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  context: string | undefined;
  data: unknown;
  timestamp: string;
}

function formatEntry(entry: LogEntry): string {
  const parts = [`[${entry.timestamp}]`, `[${entry.level.toUpperCase()}]`];
  if (entry.context) parts.push(`[${entry.context}]`);
  parts.push(entry.message);
  return parts.join(' ');
}

function log(level: LogLevel, message: string, context?: string, data?: unknown): void {
  if (ENV.IS_PRODUCTION && level !== 'error') return;

  const entry: LogEntry = {
    level,
    message,
    context,
    data,
    timestamp: new Date().toISOString(),
  };

  const formatted = formatEntry(entry);

  switch (level) {
    case 'debug':
      // eslint-disable-next-line no-console
      console.debug(formatted, data !== undefined ? data : '');
      break;
    case 'info':
      // eslint-disable-next-line no-console
      console.info(formatted, data !== undefined ? data : '');
      break;
    case 'warn':
      // eslint-disable-next-line no-console
      console.warn(formatted, data !== undefined ? data : '');
      break;
    case 'error':
      // eslint-disable-next-line no-console
      console.error(formatted, data !== undefined ? data : '');
      break;
  }
}

export const Logger = {
  debug: (message: string, context?: string, data?: unknown) =>
    log('debug', message, context, data),
  info: (message: string, context?: string, data?: unknown) =>
    log('info', message, context, data),
  warn: (message: string, context?: string, data?: unknown) =>
    log('warn', message, context, data),
  error: (message: string, context?: string, data?: unknown) =>
    log('error', message, context, data),
} as const;
