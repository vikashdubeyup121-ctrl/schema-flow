import { useState, useCallback } from 'react';
import { StorageService } from '@/shared/services/storage.service';

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    const item = StorageService.get<T>(key);
    return item !== null ? item : initialValue;
  });

  const setValue = useCallback(
    (value: T) => {
      setStoredValue(value);
      StorageService.set(key, value);
    },
    [key],
  );

  const removeValue = useCallback(() => {
    setStoredValue(initialValue);
    StorageService.remove(key);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}
