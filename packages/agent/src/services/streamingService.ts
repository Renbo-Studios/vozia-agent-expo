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
 * Uses XMLHttpRequest for React Native compatibility where fetch stream is not supported
 */
export class StreamingService {
  private config: Required<Omit<StreamingConfig, 'jwt'>> & Pick<StreamingConfig, 'jwt'>;
  private xhr: XMLHttpRequest | null = null;
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
    this.log('Connecting to stream (XHR)', { url });

    return new Promise<void>((resolve) => {
      this.xhr = new XMLHttpRequest();
      const xhr = this.xhr;
      
      xhr.open('POST', url, true);
      
      // Set headers
      const headers = this.buildHeaders();
      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });

      // State for processing
      let lastProcessedIndex = 0;
      let buffer = '';

      xhr.onprogress = () => {
        if (!this.isConnected && xhr.readyState >= 2) {
           this.isConnected = true;
        }

        const responseText = xhr.responseText;
        const newContent = responseText.substring(lastProcessedIndex);
        lastProcessedIndex = responseText.length;

        if (newContent.length > 0) {
          // this.log('Received chunk raw:', { length: newContent.length });
          buffer += newContent;
          
          // Process complete SSE messages
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer

          for (const line of lines) {
            if (line.trim()) {
              this.processSSELine(line, callbacks);
            }
          }
        }
      };

      xhr.onload = () => {
        this.log('XHR Load Complete', { status: xhr.status });
        
        if (xhr.status >= 200 && xhr.status < 300) {
          // Process any remaining buffer
          if (buffer.trim()) {
            this.processSSELine(buffer, callbacks);
          }
          callbacks.onComplete();
        } else {
           // Handle error response
           try {
             const errorData = JSON.parse(xhr.responseText);
             const errorMessage = errorData.error?.message || errorData.message || `HTTP ${xhr.status}`;
             callbacks.onError(this.createError('NETWORK_ERROR', errorMessage));
           } catch (e) {
             callbacks.onError(this.createError('NETWORK_ERROR', `HTTP ${xhr.status}: ${xhr.statusText}`));
           }
        }
        
        this.isConnected = false;
        resolve();
      };

      xhr.onerror = (e) => {
        this.log('XHR Error', { error: e });
        callbacks.onError(this.createError('NETWORK_ERROR', 'Network request failed'));
        this.isConnected = false;
        resolve();
      };
      
      xhr.ontimeout = () => {
        this.log('XHR Timeout');
        callbacks.onError(this.createError('TIMEOUT_ERROR', 'Request timed out'));
        this.isConnected = false;
        resolve();
      };

      // Set timeout
      // xhr.timeout = this.config.timeout; // Optional: XHR timeout can be tricky in RN

      // Send request
      xhr.send(JSON.stringify({ ...body, stream: true }));
      this.isConnected = true; // Optimistically set connected
    });
  }

  /**
   * Disconnect from streaming
   */
  disconnect(): void {
    if (this.xhr) {
      try {
        this.xhr.abort();
      } catch (e) {
        // Ignore abort errors
      }
      this.xhr = null;
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
        this.log('Received DONE marker');
        callbacks.onComplete();
        return;
      }

      try {
        const event = JSON.parse(data) as StreamEvent;
        // this.log('Parsed event:', { type: event.type });
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
        this.log('Failed to parse SSE data', { data, error: parseError }, 'warn');
      }
    } else {
        // this.log('Line did not start with data:', { line: trimmedLine });
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
   * Create an error object
   */
  private createError(code: AgentError['code'], message: string): AgentError {
    return { code, message };
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