// ============================================================================
// VOZIA AGENT SDK - EVENT EMITTER
// ============================================================================

type EventHandler<T> = (event: T) => void;

/**
 * Simple typed event emitter for agent events
 */
export class EventEmitter<TEvent extends { type: string }> {
  private listeners: Map<string, Set<EventHandler<TEvent>>> = new Map();
  private anyListeners: Set<EventHandler<TEvent>> = new Set();

  /**
   * Subscribe to events of a specific type
   */
  on<T extends TEvent['type']>(
    type: T,
    handler: EventHandler<Extract<TEvent, { type: T }>>
  ): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(handler as EventHandler<TEvent>);

    // Return unsubscribe function
    return () => {
      this.listeners.get(type)?.delete(handler as EventHandler<TEvent>);
    };
  }

  /**
   * Subscribe once to events of a specific type
   */
  once<T extends TEvent['type']>(
    type: T,
    handler: EventHandler<Extract<TEvent, { type: T }>>
  ): () => void {
    const wrappedHandler = (event: TEvent) => {
      this.listeners.get(type)?.delete(wrappedHandler);
      (handler as EventHandler<TEvent>)(event);
    };

    return this.on(type, wrappedHandler as EventHandler<Extract<TEvent, { type: T }>>);
  }

  /**
   * Subscribe to all events
   */
  onAny(handler: EventHandler<TEvent>): () => void {
    this.anyListeners.add(handler);

    return () => {
      this.anyListeners.delete(handler);
    };
  }

  /**
   * Remove a specific listener
   */
  off<T extends TEvent['type']>(
    type: T,
    handler: EventHandler<Extract<TEvent, { type: T }>>
  ): void {
    this.listeners.get(type)?.delete(handler as EventHandler<TEvent>);
  }

  /**
   * Remove all listeners for a type or all listeners
   */
  removeAllListeners(type?: TEvent['type']): void {
    if (type) {
      this.listeners.delete(type);
    } else {
      this.listeners.clear();
      this.anyListeners.clear();
    }
  }

  /**
   * Emit an event
   */
  emit(event: TEvent): void {
    // Notify type-specific listeners
    const typeListeners = this.listeners.get(event.type);
    if (typeListeners) {
      typeListeners.forEach((handler) => {
        try {
          handler(event);
        } catch (error) {
          console.error('[VoziaAgent] Event handler error:', error);
        }
      });
    }

    // Notify "any" listeners
    this.anyListeners.forEach((handler) => {
      try {
        handler(event);
      } catch (error) {
        console.error('[VoziaAgent] Event handler error:', error);
      }
    });
  }

  /**
   * Get listener count for a type
   */
  listenerCount(type?: TEvent['type']): number {
    if (type) {
      return (this.listeners.get(type)?.size ?? 0) + this.anyListeners.size;
    }

    let count = this.anyListeners.size;
    this.listeners.forEach((listeners) => {
      count += listeners.size;
    });
    return count;
  }

  /**
   * Get all event types that have listeners
   */
  eventNames(): string[] {
    return Array.from(this.listeners.keys());
  }
}
