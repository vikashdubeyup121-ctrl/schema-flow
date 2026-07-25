import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from 'react';

type ShortcutHandler = (event: KeyboardEvent) => void;

interface ShortcutRegistration {
  key: string;
  handler: ShortcutHandler;
  priority: number;
}

interface KeyboardContextValue {
  register: (key: string, handler: ShortcutHandler, priority?: number) => () => void;
}

const KeyboardContext = createContext<KeyboardContextValue | null>(null);

export function useKeyboard(): KeyboardContextValue {
  const context = useContext(KeyboardContext);
  if (!context) {
    throw new Error('useKeyboard must be used within KeyboardProvider');
  }
  return context;
}

interface KeyboardProviderProps {
  children: ReactNode;
}

function matchesShortcut(event: KeyboardEvent, key: string): boolean {
  const parts = key.toLowerCase().split('+');
  const requiredKey = parts[parts.length - 1];

  const requiresCtrl = parts.includes('ctrl') || parts.includes('meta');
  const requiresShift = parts.includes('shift');
  const requiresAlt = parts.includes('alt');

  const ctrlMatch = requiresCtrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
  const shiftMatch = requiresShift ? event.shiftKey : !event.shiftKey;
  const altMatch = requiresAlt ? event.altKey : !event.altKey;
  const keyMatch = requiredKey !== undefined && event.key.toLowerCase() === requiredKey;

  return ctrlMatch && shiftMatch && altMatch && keyMatch;
}

export function KeyboardProvider({ children }: KeyboardProviderProps): ReactNode {
  const registrationsRef = useRef<ShortcutRegistration[]>([]);

  const register = useCallback(
    (key: string, handler: ShortcutHandler, priority = 0): (() => void) => {
      const registration: ShortcutRegistration = { key, handler, priority };
      registrationsRef.current = [...registrationsRef.current, registration].sort(
        (a, b) => b.priority - a.priority,
      );

      return () => {
        registrationsRef.current = registrationsRef.current.filter((r) => r !== registration);
      };
    },
    [],
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      const target = event.target as HTMLElement;
      const isTextInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      for (const registration of registrationsRef.current) {
        if (matchesShortcut(event, registration.key)) {
          if (isTextInput && registration.priority < 100) continue;
          event.preventDefault();
          registration.handler(event);
          break;
        }
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return <KeyboardContext.Provider value={{ register }}>{children}</KeyboardContext.Provider>;
}
