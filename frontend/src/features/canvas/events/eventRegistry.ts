import type { CanvasEventTypeValue, CanvasEvent } from './eventTypes';
import { canvasEventBus } from './eventBus';

type EventHandler<T = unknown> = (event: CanvasEvent<T>) => void;

const registeredHandlers: Array<() => void> = [];

export function registerEventHandler<T>(
  type: CanvasEventTypeValue,
  handler: EventHandler<T>,
): () => void {
  const unsubscribe = canvasEventBus.subscribe(type, handler);
  registeredHandlers.push(unsubscribe);
  return unsubscribe;
}

export function unregisterAllHandlers(): void {
  for (const unsubscribe of registeredHandlers) {
    unsubscribe();
  }
  registeredHandlers.length = 0;
}
