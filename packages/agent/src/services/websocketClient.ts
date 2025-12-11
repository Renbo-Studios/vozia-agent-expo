// ============================================================================
// VOZIA AGENT SDK - WEBSOCKET CLIENT
// ============================================================================

import type { AgentError, ConnectionStatus } from '../types';
import { CONSTANTS } from '../core/config';
import { EventEmitter } from '../utils/eventEmitter';

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export interface WebSocketConfig {
  url: string;
  apiKey: string;
  jwt?: string;
  protocols?: string[];
  reconnect?: boolean;
  maxReconnectAttempts?: number;
  debug?: boolean;
}

export type WebSocketEvent =
  | { type: 'open' }
  | { type: 'close'; code: number; reason: string }
  | { type: 'message'; data: unknown }
  | { type: 'error'; error: Error }
  | { type: 'reconnecting'; attempt: number }
  | { type: 'status_change'; status: ConnectionStatus };

// ----------------------------------------------------------------------------
// WebSocket Client
// ----------------------------------------------------------------------------

/**
 * WebSocket client with auto-reconnect and event handling
 */
export class WebSocketClient {
  private config: Required<Omit<WebSocketConfig, 'jwt' | 'protocols'>> &
    Pick<WebSocketConfig, 'jwt' | 'protocols'>;
  private ws: WebSocket | null = null;
  private eventEmitter: EventEmitter<WebSocketEvent>;
  private reconnectAttempts = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private status: ConnectionStatus = 'disconnected';
  private manualClose = false;

  constructor(config: WebSocketConfig) {
    this.config = {
      url: config.url,
      apiKey: config.apiKey,
      jwt: config.jwt,
      protocols: config.protocols,
      reconnect: config.reconnect ?? true,
      maxReconnectAttempts: config.maxReconnectAttempts ?? CONSTANTS.MAX_RECONNECT_ATTEMPTS,
      debug: config.debug ?? false,
    };

    this.eventEmitter = new EventEmitter<WebSocketEvent>();
  }

  // --------------------------------------------------------------------------
  // Public Methods
  // --------------------------------------------------------------------------

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    if (this.ws && this.status === 'connected') {
      this.log('Already connected');
      return;
    }

    this.manualClose = false;
    this.setStatus('connecting');

    try {
      // Build URL with auth params
      const url = this.buildUrl();
      this.log('Connecting', { url });

      this.ws = new WebSocket(url, this.config.protocols);
      this.setupEventHandlers();
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(code = 1000, reason = 'Client disconnect'): void {
    this.manualClose = true;
    this.clearTimers();

    if (this.ws) {
      this.log('Disconnecting', { code, reason });
      this.ws.close(code, reason);
      this.ws = null;
    }

    this.setStatus('disconnected');
  }

  /**
   * Send a message
   */
  send(data: unknown): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.log('Cannot send - not connected', {}, 'warn');
      return;
    }

    const message = typeof data === 'string' ? data : JSON.stringify(data);
    this.ws.send(message);
    this.log('Sent', { data });
  }

  /**
   * Send binary data
   */
  sendBinary(data: ArrayBuffer | Blob): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.log('Cannot send - not connected', {}, 'warn');
      return;
    }

    this.ws.send(data);
    this.log('Sent binary', { size: data instanceof Blob ? data.size : data.byteLength });
  }

  /**
   * Subscribe to events
   */
  on<T extends WebSocketEvent['type']>(
    type: T,
    handler: (event: Extract<WebSocketEvent, { type: T }>) => void
  ): () => void {
    return this.eventEmitter.on(type, handler);
  }

  /**
   * Subscribe to all events
   */
  onAny(handler: (event: WebSocketEvent) => void): () => void {
    return this.eventEmitter.onAny(handler);
  }

  /**
   * Get current status
   */
  getStatus(): ConnectionStatus {
    return this.status;
  }

  /**
   * Check if connected
   */
  get isConnected(): boolean {
    return this.status === 'connected' && this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Update JWT token (will reconnect if connected)
   */
  setJwt(jwt: string | undefined): void {
    this.config.jwt = jwt;

    if (this.isConnected) {
      this.disconnect();
      this.connect();
    }
  }

  // --------------------------------------------------------------------------
  // Private Methods
  // --------------------------------------------------------------------------

  /**
   * Build WebSocket URL with auth
   */
  private buildUrl(): string {
    const url = new URL(this.config.url);

    // Add auth params
    url.searchParams.set('apiKey', this.config.apiKey);
    if (this.config.jwt) {
      url.searchParams.set('token', this.config.jwt);
    }

    return url.toString();
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      this.log('Connected');
      this.reconnectAttempts = 0;
      this.setStatus('connected');
      this.emit({ type: 'open' });
      this.startPingInterval();
    };

    this.ws.onclose = (event) => {
      this.log('Closed', { code: event.code, reason: event.reason });
      this.clearTimers();
      this.emit({ type: 'close', code: event.code, reason: event.reason });

      if (!this.manualClose && this.config.reconnect) {
        this.scheduleReconnect();
      } else {
        this.setStatus('disconnected');
      }
    };

    this.ws.onmessage = (event) => {
      this.log('Received', { data: event.data });

      let data: unknown = event.data;

      // Try to parse JSON
      if (typeof event.data === 'string') {
        try {
          data = JSON.parse(event.data);
        } catch {
          // Keep as string
        }
      }

      this.emit({ type: 'message', data });
    };

    this.ws.onerror = (event) => {
      this.handleError(event);
    };
  }

  /**
   * Handle WebSocket errors
   */
  private handleError(error: unknown): void {
    this.log('Error', { error }, 'error');
    this.setStatus('error');

    const errorObj = error instanceof Error ? error : new Error('WebSocket error');
    this.emit({ type: 'error', error: errorObj });
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      this.log('Max reconnect attempts reached', {}, 'warn');
      this.setStatus('error');
      return;
    }

    this.setStatus('reconnecting');
    this.reconnectAttempts++;

    // Calculate delay with exponential backoff
    const delay = Math.min(
      CONSTANTS.RECONNECT_BASE_DELAY * Math.pow(2, this.reconnectAttempts - 1),
      CONSTANTS.RECONNECT_MAX_DELAY
    );

    this.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    this.emit({ type: 'reconnecting', attempt: this.reconnectAttempts });

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Start ping interval for connection health
   */
  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      if (this.isConnected) {
        // Send ping (protocol-specific, adjust as needed)
        this.send({ type: 'ping', timestamp: Date.now() });
      }
    }, 30000); // Ping every 30 seconds
  }

  /**
   * Clear all timers
   */
  private clearTimers(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Set connection status and emit event
   */
  private setStatus(status: ConnectionStatus): void {
    if (this.status !== status) {
      this.status = status;
      this.emit({ type: 'status_change', status });
    }
  }

  /**
   * Emit an event
   */
  private emit(event: WebSocketEvent): void {
    this.eventEmitter.emit(event);
  }

  /**
   * Debug logging
   */
  private log(
    message: string,
    data?: Record<string, unknown>,
    level: 'log' | 'warn' | 'error' = 'log'
  ): void {
    if (!this.config.debug) return;

    const logMessage = `[VoziaAgent:WS] ${message}`;
    if (data) {
      console[level](logMessage, data);
    } else {
      console[level](logMessage);
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.disconnect();
    this.eventEmitter.removeAllListeners();
  }
}
