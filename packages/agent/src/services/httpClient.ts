// ============================================================================
// VOZIA AGENT SDK - HTTP CLIENT
// ============================================================================

import type { AgentError, ApiResponse } from '../types';
import { CONSTANTS } from '../core/config';

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export interface HttpClientConfig {
  baseUrl: string;
  apiKey: string;
  jwt?: string;
  timeout?: number;
  debug?: boolean;
}

export interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  body?: unknown;
  headers?: Record<string, string>;
  timeout?: number;
  signal?: AbortSignal;
}

// ----------------------------------------------------------------------------
// HTTP Client
// ----------------------------------------------------------------------------

/**
 * HTTP client for API requests with retry logic and error handling
 */
export class HttpClient {
  private config: Required<Omit<HttpClientConfig, 'jwt'>> & Pick<HttpClientConfig, 'jwt'>;
  private retryCount = 0;
  private maxRetries = 3;

  constructor(config: HttpClientConfig) {
    this.config = {
      baseUrl: config.baseUrl,
      apiKey: config.apiKey,
      jwt: config.jwt,
      timeout: config.timeout ?? CONSTANTS.REQUEST_TIMEOUT,
      debug: config.debug ?? false,
    };
  }

  // --------------------------------------------------------------------------
  // Public Methods
  // --------------------------------------------------------------------------

  /**
   * Perform a GET request
   */
  async get<T>(path: string, options?: Partial<RequestOptions>): Promise<T> {
    return this.request<T>({ method: 'GET', path, ...options });
  }

  /**
   * Perform a POST request
   */
  async post<T>(path: string, body?: unknown, options?: Partial<RequestOptions>): Promise<T> {
    return this.request<T>({ method: 'POST', path, body, ...options });
  }

  /**
   * Perform a PUT request
   */
  async put<T>(path: string, body?: unknown, options?: Partial<RequestOptions>): Promise<T> {
    return this.request<T>({ method: 'PUT', path, body, ...options });
  }

  /**
   * Perform a PATCH request
   */
  async patch<T>(path: string, body?: unknown, options?: Partial<RequestOptions>): Promise<T> {
    return this.request<T>({ method: 'PATCH', path, body, ...options });
  }

  /**
   * Perform a DELETE request
   */
  async delete<T>(path: string, options?: Partial<RequestOptions>): Promise<T> {
    return this.request<T>({ method: 'DELETE', path, ...options });
  }

  /**
   * Update JWT token
   */
  setJwt(jwt: string | undefined): void {
    this.config.jwt = jwt;
  }

  /**
   * Update API key
   */
  setApiKey(apiKey: string): void {
    this.config.apiKey = apiKey;
  }

  // --------------------------------------------------------------------------
  // Private Methods
  // --------------------------------------------------------------------------

  /**
   * Perform an HTTP request
   */
  private async request<T>(options: RequestOptions): Promise<T> {
    const url = this.buildUrl(options.path);
    const headers = this.buildHeaders(options.headers);
    const timeout = options.timeout ?? this.config.timeout;

    this.log(`${options.method} ${options.path}`, { body: options.body });

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: options.method,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: options.signal ?? controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle non-OK responses
      if (!response.ok) {
        const error = await this.handleErrorResponse(response);

        // Retry on rate limit or server errors
        if (this.shouldRetry(response.status) && this.retryCount < this.maxRetries) {
          return this.retryRequest<T>(options, response.status);
        }

        throw error;
      }

      // Parse response
      const data = await this.parseResponse<T>(response);
      this.retryCount = 0; // Reset retry count on success

      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw this.createError('TIMEOUT_ERROR', `Request timed out after ${timeout}ms`);
      }

      // Network error - retry if possible
      if (this.isNetworkError(error) && this.retryCount < this.maxRetries) {
        return this.retryRequest<T>(options, 0);
      }

      throw this.normalizeError(error);
    }
  }

  /**
   * Build full URL
   */
  private buildUrl(path: string): string {
    const baseUrl = this.config.baseUrl.replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
  }

  /**
   * Build request headers
   */
  private buildHeaders(custom?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-API-Key': this.config.apiKey,
    };

    if (this.config.jwt) {
      headers['Authorization'] = `Bearer ${this.config.jwt}`;
    }

    return { ...headers, ...custom };
  }

  /**
   * Parse response body
   */
  private async parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      const json = await response.json() as ApiResponse<T>;

      // Handle wrapped API responses
      if ('success' in json && 'data' in json) {
        if (!json.success && json.error) {
          throw this.createError(
            json.error.code as AgentError['code'] || 'UNKNOWN_ERROR',
            json.error.message
          );
        }
        return json.data as T;
      }

      return json as T;
    }

    // Return text for non-JSON responses
    const text = await response.text();
    return text as unknown as T;
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

    // Map status codes to error codes
    switch (response.status) {
      case 400:
        code = 'INVALID_CONFIG';
        break;
      case 401:
        code = 'AUTHENTICATION_ERROR';
        message = 'Invalid API key or unauthorized';
        break;
      case 403:
        code = 'AUTHENTICATION_ERROR';
        message = 'Access forbidden';
        break;
      case 404:
        code = 'NETWORK_ERROR';
        message = 'Resource not found';
        break;
      case 429:
        code = 'RATE_LIMIT_ERROR';
        message = 'Rate limit exceeded. Please try again later.';
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        code = 'NETWORK_ERROR';
        message = 'Server error. Please try again later.';
        break;
    }

    return this.createError(code, message);
  }

  /**
   * Check if request should be retried
   */
  private shouldRetry(status: number): boolean {
    return status === 429 || status >= 500;
  }

  /**
   * Check if error is a network error
   */
  private isNetworkError(error: unknown): boolean {
    if (error instanceof TypeError) {
      return error.message.includes('fetch') || error.message.includes('network');
    }
    return false;
  }

  /**
   * Retry a failed request with exponential backoff
   */
  private async retryRequest<T>(options: RequestOptions, status: number): Promise<T> {
    this.retryCount++;

    // Calculate delay with exponential backoff
    const baseDelay = status === 429 ? 5000 : CONSTANTS.RECONNECT_BASE_DELAY;
    const delay = Math.min(
      baseDelay * Math.pow(2, this.retryCount - 1),
      CONSTANTS.RECONNECT_MAX_DELAY
    );

    this.log(`Retrying request (attempt ${this.retryCount}/${this.maxRetries}) in ${delay}ms`);

    await this.sleep(delay);
    return this.request<T>(options);
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
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Debug logging
   */
  private log(message: string, data?: Record<string, unknown>): void {
    if (!this.config.debug) return;

    if (data) {
      console.log(`[VoziaAgent:HTTP] ${message}`, data);
    } else {
      console.log(`[VoziaAgent:HTTP] ${message}`);
    }
  }
}
