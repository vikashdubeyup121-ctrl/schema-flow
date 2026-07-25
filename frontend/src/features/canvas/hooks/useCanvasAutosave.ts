import { useEffect, useRef, useState, useCallback } from 'react';
import { EDITOR } from '@/config/editor';
import { Logger } from '@/shared/services';

export type AutosaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

interface UseCanvasAutosaveOptions {
  isDirty: boolean;
  onSave: () => Promise<void>;
}

interface UseCanvasAutosaveReturn {
  status: AutosaveStatus;
  lastSavedAt: Date | null;
  flush: () => Promise<void>;
}

export function useCanvasAutosave({
  isDirty,
  onSave,
}: UseCanvasAutosaveOptions): UseCanvasAutosaveReturn {
  const [status, setStatus] = useState<AutosaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onSaveRef = useRef(onSave);
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  const flush = useCallback(async () => {
    setStatus('saving');
    try {
      await onSaveRef.current();
      setLastSavedAt(new Date());
      setStatus('saved');
    } catch (err) {
      Logger.error('Autosave failed', 'useCanvasAutosave', err);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    if (!isDirty) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus('dirty');

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      void flush();
    }, EDITOR.AUTOSAVE_INTERVAL_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isDirty, flush]);

  return { status, lastSavedAt, flush };
}
