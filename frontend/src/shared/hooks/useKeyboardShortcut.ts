import { useEffect } from 'react';

interface ShortcutOptions {
  enabled?: boolean;
  preventDefault?: boolean;
}

export function useKeyboardShortcut(
  key: string,
  handler: (event: KeyboardEvent) => void,
  options: ShortcutOptions = {},
): void {
  const { enabled = true, preventDefault = true } = options;

  useEffect(() => {
    if (!enabled) return;

    function listener(event: KeyboardEvent): void {
      const parts = key.toLowerCase().split('+');
      const requiredKey = parts[parts.length - 1];
      const requiresCtrl = parts.includes('ctrl') || parts.includes('meta');
      const requiresShift = parts.includes('shift');
      const requiresAlt = parts.includes('alt');

      const ctrlMatch = requiresCtrl ? event.ctrlKey || event.metaKey : true;
      const shiftMatch = requiresShift ? event.shiftKey : true;
      const altMatch = requiredKey && requiredKey !== '' && requiresAlt ? event.altKey : true;
      const keyMatch =
        requiredKey !== undefined && event.key.toLowerCase() === requiredKey;

      if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
        if (preventDefault) event.preventDefault();
        handler(event);
      }
    }

    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [key, handler, enabled, preventDefault]);
}
