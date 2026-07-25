import type { CanvasEventTypeValue, CanvasEvent } from './eventTypes';
import { generateEventId } from '../utils/ids';

type EventHandler<T = unknown> = (event: CanvasEvent<T>) => void;

class CanvasEventBus {
  private readonly handlers = new Map<string, Set<EventHandler>>();

  subscribe<T>(type: CanvasEventTypeValue, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    const handlerSet = this.handlers.get(type)!;
    handlerSet.add(handler as EventHandler);

    return () => {
      handlerSet.delete(handler as EventHandler);
    };
  }

  publish<T>(type: CanvasEventTypeValue, payload: T): void {
    const event: CanvasEvent<T> = {
      id: generateEventId(),
      type,
      timestamp: Date.now(),
      payload,
    };

    const handlerSet = this.handlers.get(type);
    if (!handlerSet) return;

    for (const handler of handlerSet) {
      handler(event);
    }
  }

  clear(): void {
    this.handlers.clear();
  }
}

export const canvasEventBus = new CanvasEventBus();
