import { Logger } from './logger.service';

function get<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch {
    Logger.error(`Failed to read from storage: ${key}`, 'StorageService');
    return null;
  }
}

function set<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    Logger.error(`Failed to write to storage: ${key}`, 'StorageService');
  }
}

function remove(key: string): void {
  localStorage.removeItem(key);
}

function clear(): void {
  localStorage.clear();
}

export const StorageService = { get, set, remove, clear } as const;
