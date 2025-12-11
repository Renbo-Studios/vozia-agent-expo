// ============================================================================
// VOZIA AGENT SDK - STREAMING SERVICE (SSE)
// ============================================================================

import type { AgentError, StreamEvent } from '../types';
import { CONSTANTS } from '../core/config';

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export interface StreamingConfig {
  baseUrl: string;
  apiKey: string;
  jwt?: string;
  timeout?: number;
  debug?: boolean;
}

export interface StreamingCallbacks {
  onEvent: (event: StreamEvent) => void;
  onError: (error: AgentError) => void;
  onComplete: () => void;
}

// ----------------------------------------------------------------------------
// Streaming Service
// ----------------------------------------------------------------------------

/**
 * Server-Sent Events (SSE) streaming client for real-time responses
 */
export class StreamingService {
  private config: Required<Omit<StreamingConfig, 'jwt'>> & Pick<StreamingConfig, 'jwt'>;
  private abortController: AbortController | null = null;
  private isConnected = false;

  constructor(config: StreamingConfig) {
    this.config = {
      baseUrl: config.baseUrl,
      apiKey: config.apiKey,
      jwt: config.jwt,
      timeout: config.timeout ?? CONSTANTS.SSE_TIMEOUT,
      debug: config.debug ?? false,
    };
  }

  // --------------------------------------------------------------------------
  // Public Methods
  // --------------------------------------------------------------------------

  /**
   * Connect to streaming endpoint
   */
  async connect(
    endpoint: string,
    body: Record<string, unknown>,
    callbacks: StreamingCallbacks
  ): Promise<void> {
    // Disconnect any existing connection
    this.disconnect();

    const url = this.buildUrl(endpoint);
    this.abortController = new AbortController();

    this.log('Connecting to stream', { url });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify({ ...body, stream: true }),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        const error = await this.handleErrorResponse(response);
        callbacks.onError(error);
        return;
      }

      if (!response.body) {
        callbacks.onError(this.createError('NETWORK_ERROR', 'No response body'));
        return;
      }

      this.isConnected = true;
      await this.processStream(response.body, callbacks);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        this.log('Stream aborted');
        return;
      }

      callbacks.onError(this.normalizeError(error));
    } finally {
      this.isConnected = false;
    }
  }

  /**
   * Disconnect from streaming
   */
  disconnect(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.isConnected = false;
    this.log('Disconnected');
  }

  /**
   * Check if connected
   */
  get connected(): boolean {
    return this.isConnected;
  }

  /**
   * Update JWT token
   */
  setJwt(jwt: string | undefined): void {
    this.config.jwt = jwt;
  }

  // --------------------------------------------------------------------------
  // Private Methods
  // --------------------------------------------------------------------------

  /**
   * Process the SSE stream
   */
  private async processStream(
    body: ReadableStream<Uint8Array>,
    callbacks: StreamingCallbacks
  ): Promise<void> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          this.log('Stream complete');
          callbacks.onComplete();
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE messages
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          this.processSSELine(line, callbacks);
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      throw error;
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Process a single SSE line
   */
  private processSSELine(line: string, callbacks: StreamingCallbacks): void {
    const trimmedLine = line.trim();

    // Skip empty lines and comments
    if (!trimmedLine || trimmedLine.startsWith(':')) {
      return;
    }

    // Parse SSE data
    if (trimmedLine.startsWith('data:')) {
      const data = trimmedLine.slice(5).trim();

      // Handle "[DONE]" marker
      if (data === '[DONE]') {
        callbacks.onComplete();
        return;
      }

      try {
        const event = JSON.parse(data) as StreamEvent;
        this.log('Received event', { type: event.type });
        callbacks.onEvent(event);

        // Handle error events
        if (event.type === 'error') {
          callbacks.onError(
            this.createError('NETWORK_ERROR', event.message || 'Stream error')
          );
        }

        // Handle complete event
        if (event.type === 'complete') {
          callbacks.onComplete();
        }
      } catch (parseError) {
        this.log('Failed to parse SSE data', { data }, 'warn');
      }
    }
  }

  /**
   * Build full URL
   */
  private buildUrl(endpoint: string): string {
    const baseUrl = this.config.baseUrl.replace(/\/$/, '');
    const cleanPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${baseUrl}${cleanPath}`;
  }

  /**
   * Build request headers
   */
  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
      'X-API-Key': this.config.apiKey,
      'Cache-Control': 'no-cache',
    };

    if (this.config.jwt) {
      headers['Authorization'] = `Bearer ${this.config.jwt}`;
    }

    return headers;
  }

  /**
   * Handle error response
   */
  private async handleErrorResponse(response: Response): Promise<AgentError> {
    let message = `HTTP ${response.status}: ${response.statusText}`;
    let code: AgentError['code'] = 'NETWORK_ERROR';

    try {
      const body = await response.json();
      if (body.error?.message) {
        message = body.error.message;
      } else if (body.message) {
        message = body.message;
      }
    } catch {
      // Ignore JSON parse errors
    }

    switch (response.status) {
      case 401:
        code = 'AUTHENTICATION_ERROR';
        message = 'Invalid API key or unauthorized';
        break;
      case 429:
        code = 'RATE_LIMIT_ERROR';
        message = 'Rate limit exceeded';
        break;
    }

    return this.createError(code, message);
  }

  /**
   * Create an error object
   */
  private createError(code: AgentError['code'], message: string): AgentError {
    return { code, message };
  }

  /**
   * Normalize any error to AgentError
   */
  private normalizeError(error: unknown): AgentError {
    if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
      return error as AgentError;
    }

    if (error instanceof Error) {
      return this.createError('NETWORK_ERROR', error.message);
    }

    return this.createError('UNKNOWN_ERROR', 'An unexpected error occurred');
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

    const logMessage = `[VoziaAgent:Stream] ${message}`;
    if (data) {
      console[level](logMessage, data);
    } else {
      console[level](logMessage);
    }
  }
}
