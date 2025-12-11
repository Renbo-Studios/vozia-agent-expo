// ============================================================================
// VOZIA AGENT SDK - AGENT CLIENT
// ============================================================================

import type {
  AgentConfig,
  AgentFeatures,
  AgentTheme,
  AgentEvent,
  AgentEventHandler,
  Message,
  Session,
  ChatResponse,
  ToolDefinition,
  ToolCall,
  ToolResult,
  AgentError,
  ConnectionStatus,
  StreamEvent,
} from '../types';

import {
  validateConfig,
  mergeConfig,
  mergeFeatures,
  mergeTheme,
  generateSessionId,
  generateMessageId,
  API_ENDPOINTS,
  CONSTANTS,
} from './config';

import { HttpClient } from '../services/httpClient';
import { StreamingService } from '../services/streamingService';
import { EventEmitter } from '../utils/eventEmitter';

// ----------------------------------------------------------------------------
// Agent Client
// ----------------------------------------------------------------------------

/**
 * Main Vozia Agent client for interacting with the AI assistant
 */
export class AgentClient {
  private config: ReturnType<typeof mergeConfig>;
  private features: AgentFeatures;
  private theme: AgentTheme;
  private httpClient: HttpClient;
  private streamingService: StreamingService;
  private eventEmitter: EventEmitter<AgentEvent>;
  private tools: Map<string, ToolDefinition>;
  private currentSessionId: string | null = null;
  private connectionStatus: ConnectionStatus = 'disconnected';
  private debug: boolean;

  // Singleton instance
  private static instance: AgentClient | null = null;

  constructor(
    config: AgentConfig,
    options?: {
      features?: Partial<AgentFeatures>;
      theme?: Partial<AgentTheme>;
      isDark?: boolean;
      debug?: boolean;
    }
  ) {
    // Validate configuration
    validateConfig(config);

    // Merge with defaults
    this.config = mergeConfig(config);
    this.features = mergeFeatures(options?.features);
    this.theme = mergeTheme(options?.theme, options?.isDark);
    this.debug = options?.debug ?? false;

    // Initialize services
    this.httpClient = new HttpClient({
      baseUrl: this.config.baseUrl,
      apiKey: this.config.apiKey,
      jwt: this.config.jwt,
      timeout: CONSTANTS.REQUEST_TIMEOUT,
      debug: this.debug,
    });

    this.streamingService = new StreamingService({
      baseUrl: this.config.baseUrl,
      apiKey: this.config.apiKey,
      jwt: this.config.jwt,
      timeout: CONSTANTS.SSE_TIMEOUT,
      debug: this.debug,
    });

    this.eventEmitter = new EventEmitter<AgentEvent>();
    this.tools = new Map();

    this.log('AgentClient initialized', { assistantId: this.config.assistantId });
  }

  // --------------------------------------------------------------------------
  // Static Methods
  // --------------------------------------------------------------------------

  /**
   * Initialize the global agent instance
   */
  static initialize(
    config: AgentConfig,
    options?: {
      features?: Partial<AgentFeatures>;
      theme?: Partial<AgentTheme>;
      isDark?: boolean;
      debug?: boolean;
    }
  ): AgentClient {
    if (AgentClient.instance) {
      AgentClient.instance.destroy();
    }
    AgentClient.instance = new AgentClient(config, options);
    return AgentClient.instance;
  }

  /**
   * Get the global agent instance
   */
  static getInstance(): AgentClient {
    if (!AgentClient.instance) {
      throw new Error('AgentClient not initialized. Call AgentClient.initialize() first.');
    }
    return AgentClient.instance;
  }

  /**
   * Check if an instance exists
   */
  static hasInstance(): boolean {
    return AgentClient.instance !== null;
  }

  // --------------------------------------------------------------------------
  // Configuration Getters
  // --------------------------------------------------------------------------

  getConfig(): Readonly<ReturnType<typeof mergeConfig>> {
    return { ...this.config };
  }

  getFeatures(): Readonly<AgentFeatures> {
    return { ...this.features };
  }

  getTheme(): Readonly<AgentTheme> {
    return { ...this.theme };
  }

  getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  getCurrentSessionId(): string | null {
    return this.currentSessionId;
  }

  // --------------------------------------------------------------------------
  // Chat Methods
  // --------------------------------------------------------------------------

  /**
   * Send a message and get a streaming response
   */
  async chat(
    message: string,
    options?: {
      sessionId?: string;
      stream?: boolean;
      onToken?: (token: string) => void;
      onThinking?: (message: string) => void;
      onComplete?: (response: ChatResponse) => void;
      onError?: (error: AgentError) => void;
    }
  ): Promise<ChatResponse> {
    const sessionId = options?.sessionId || this.currentSessionId || generateSessionId();
    this.currentSessionId = sessionId;

    this.log('Sending message', { sessionId, messageLength: message.length });

    // Emit typing start
    this.emit({ type: 'typing_start' });

    try {
      if (options?.stream !== false) {
        // Streaming mode (default)
        return await this.chatStream(message, sessionId, options);
      } else {
        // Non-streaming mode
        return await this.chatSync(message, sessionId);
      }
    } catch (error) {
      const agentError = this.normalizeError(error);
      this.emit({ type: 'error', error: agentError });
      options?.onError?.(agentError);
      throw agentError;
    } finally {
      this.emit({ type: 'typing_end' });
    }
  }

  /**
   * Streaming chat implementation
   */
  private async chatStream(
    message: string,
    sessionId: string,
    options?: {
      onToken?: (token: string) => void;
      onThinking?: (message: string) => void;
      onComplete?: (response: ChatResponse) => void;
    }
  ): Promise<ChatResponse> {
    return new Promise((resolve, reject) => {
      let fullResponse = '';
      let metadata: ChatResponse['metadata'];

      const endpoint = API_ENDPOINTS.AGENT_SESSION_MESSAGE(
        this.config.assistantId,
        sessionId
      );

      this.streamingService.connect(
        endpoint,
        {
          message,
          endUserId: this.config.userId,
          userMetadata: this.config.userMetadata,
        },
        {
          onEvent: (event: StreamEvent) => {
            switch (event.type) {
              case 'thinking':
                this.log('Thinking', { message: event.message });
                this.emit({ type: 'thinking', message: event.message || '' });
                options?.onThinking?.(event.message || '');
                break;

              case 'token':
                fullResponse += event.content || '';
                this.emit({ type: 'token', content: event.content || '' });
                options?.onToken?.(event.content || '');
                break;

              case 'complete':
                metadata = {
                  iterations: event.iterations || 0,
                  handoff: event.handoff,
                };
                break;

              case 'error':
                reject(
                  this.createError('NETWORK_ERROR', event.message || 'Streaming error')
                );
                break;
            }
          },
          onError: (error) => {
            reject(this.normalizeError(error));
          },
          onComplete: () => {
            const response: ChatResponse = {
              sessionId,
              response: fullResponse,
              metadata,
            };

            // Create and emit message
            const assistantMessage: Message = {
              id: generateMessageId(),
              role: 'assistant',
              content: fullResponse,
              timestamp: new Date(),
              status: 'delivered',
              metadata: {
                iterations: metadata?.iterations,
                handoffRequested: metadata?.handoff,
              },
            };

            this.emit({ type: 'message', message: assistantMessage });
            options?.onComplete?.(response);
            resolve(response);
          },
        }
      );
    });
  }

  /**
   * Synchronous chat implementation
   */
  private async chatSync(message: string, sessionId: string): Promise<ChatResponse> {
    const endpoint = API_ENDPOINTS.AGENT_TEST(this.config.assistantId);

    const response = await this.httpClient.post<ChatResponse>(endpoint, {
      message,
      sessionId,
      endUserId: this.config.userId,
      userMetadata: this.config.userMetadata,
    });

    // Create and emit message
    const assistantMessage: Message = {
      id: generateMessageId(),
      role: 'assistant',
      content: response.response,
      timestamp: new Date(),
      status: 'delivered',
      metadata: {
        sources: response.sources,
        toolsUsed: response.toolsUsed,
        iterations: response.metadata?.iterations,
        handoffRequested: response.metadata?.handoff,
      },
    };

    this.emit({ type: 'message', message: assistantMessage });

    return response;
  }

  // --------------------------------------------------------------------------
  // Session Methods
  // --------------------------------------------------------------------------

  /**
   * Create a new session
   */
  async createSession(): Promise<Session> {
    this.log('Creating new session');

    const response = await this.httpClient.post<{ session: Session }>(
      API_ENDPOINTS.SESSIONS,
      {
        assistantId: this.config.assistantId,
        endUserId: this.config.userId,
        userMetadata: this.config.userMetadata,
      }
    );

    this.currentSessionId = response.session.id;
    this.emit({ type: 'session_created', session: response.session });

    return response.session;
  }

  /**
   * Get session details
   */
  async getSession(sessionId: string): Promise<Session> {
    const response = await this.httpClient.get<{ session: Session }>(
      API_ENDPOINTS.SESSION(sessionId)
    );
    return response.session;
  }

  /**
   * Get messages for a session
   */
  async getSessionMessages(sessionId: string): Promise<Message[]> {
    const response = await this.httpClient.get<{ messages: Message[] }>(
      API_ENDPOINTS.SESSION_MESSAGES(sessionId)
    );
    return response.messages;
  }

  /**
   * End the current session
   */
  async endSession(): Promise<void> {
    if (!this.currentSessionId) {
      return;
    }

    this.log('Ending session', { sessionId: this.currentSessionId });

    const response = await this.httpClient.patch<{ session: Session }>(
      `${API_ENDPOINTS.SESSION(this.currentSessionId)}/close`,
      {}
    );

    this.emit({ type: 'session_ended', session: response.session });
    this.currentSessionId = null;
  }

  /**
   * Set current session ID
   */
  setSessionId(sessionId: string): void {
    this.currentSessionId = sessionId;
    this.log('Session ID set', { sessionId });
  }

  // --------------------------------------------------------------------------
  // Tool Methods
  // --------------------------------------------------------------------------

  /**
   * Register a client-side tool
   */
  registerTool(tool: ToolDefinition): void {
    if (!this.features.tools) {
      this.log('Tools feature is disabled', {}, 'warn');
      return;
    }

    this.tools.set(tool.name, tool);
    this.log('Tool registered', { name: tool.name });
  }

  /**
   * Unregister a tool
   */
  unregisterTool(name: string): void {
    this.tools.delete(name);
    this.log('Tool unregistered', { name });
  }

  /**
   * Get all registered tools
   */
  getRegisteredTools(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  /**
   * Execute a tool call
   */
  async executeTool(toolCall: ToolCall): Promise<ToolResult> {
    const tool = this.tools.get(toolCall.name);

    if (!tool) {
      return {
        callId: toolCall.id,
        name: toolCall.name,
        result: null,
        error: `Tool "${toolCall.name}" not found`,
        duration: 0,
      };
    }

    this.log('Executing tool', { name: toolCall.name, args: toolCall.arguments });
    this.emit({ type: 'tool_call', tool: toolCall });

    const startTime = Date.now();

    try {
      const result = await tool.handler(toolCall.arguments);
      const duration = Date.now() - startTime;

      this.emit({ type: 'tool_result', tool: toolCall.name, result });

      return {
        callId: toolCall.id,
        name: toolCall.name,
        result,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Tool execution failed';

      return {
        callId: toolCall.id,
        name: toolCall.name,
        result: null,
        error: errorMessage,
        duration,
      };
    }
  }

  // --------------------------------------------------------------------------
  // Event Methods
  // --------------------------------------------------------------------------

  /**
   * Subscribe to agent events
   */
  on<T extends AgentEvent['type']>(
    type: T,
    handler: AgentEventHandler<T>
  ): () => void {
    return this.eventEmitter.on(type, handler as (event: AgentEvent) => void);
  }

  /**
   * Subscribe to all events
   */
  onAny(handler: (event: AgentEvent) => void): () => void {
    return this.eventEmitter.onAny(handler);
  }

  /**
   * Emit an event
   */
  private emit(event: AgentEvent): void {
    this.eventEmitter.emit(event);
  }

  // --------------------------------------------------------------------------
  // Connection Methods
  // --------------------------------------------------------------------------

  /**
   * Connect to the agent (test connection)
   */
  async connect(): Promise<void> {
    this.connectionStatus = 'connecting';

    try {
      // Test connection by fetching agent config
      await this.httpClient.get(API_ENDPOINTS.AGENT(this.config.assistantId));

      this.connectionStatus = 'connected';
      this.emit({ type: 'connected' });
      this.log('Connected successfully');
    } catch (error) {
      this.connectionStatus = 'error';
      const agentError = this.normalizeError(error);
      this.emit({ type: 'error', error: agentError });
      throw agentError;
    }
  }

  /**
   * Disconnect from the agent
   */
  disconnect(): void {
    this.streamingService.disconnect();
    this.connectionStatus = 'disconnected';
    this.emit({ type: 'disconnected' });
    this.log('Disconnected');
  }

  // --------------------------------------------------------------------------
  // Theme Methods
  // --------------------------------------------------------------------------

  /**
   * Update theme
   */
  updateTheme(theme: Partial<AgentTheme>): void {
    this.theme = { ...this.theme, ...theme };
    this.log('Theme updated');
  }

  /**
   * Toggle dark mode
   */
  toggleDarkMode(): void {
    this.theme = mergeTheme(this.theme, !this.theme.isDark);
    this.log('Dark mode toggled', { isDark: this.theme.isDark });
  }

  // --------------------------------------------------------------------------
  // Cleanup
  // --------------------------------------------------------------------------

  /**
   * Destroy the client and clean up resources
   */
  destroy(): void {
    this.disconnect();
    this.eventEmitter.removeAllListeners();
    this.tools.clear();
    this.currentSessionId = null;

    if (AgentClient.instance === this) {
      AgentClient.instance = null;
    }

    this.log('Client destroyed');
  }

  // --------------------------------------------------------------------------
  // Private Helpers
  // --------------------------------------------------------------------------

  private log(
    message: string,
    data?: Record<string, unknown>,
    level: 'log' | 'warn' | 'error' = 'log'
  ): void {
    if (!this.debug) return;

    const prefix = '[VoziaAgent]';
    const logMessage = `${prefix} ${message}`;

    if (data) {
      console[level](logMessage, data);
    } else {
      console[level](logMessage);
    }
  }

  private createError(code: AgentError['code'], message: string): AgentError {
    return { code, message };
  }

  private normalizeError(error: unknown): AgentError {
    if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
      return error as AgentError;
    }

    if (error instanceof Error) {
      // Detect specific error types
      if (error.message.includes('401') || error.message.includes('unauthorized')) {
        return this.createError('AUTHENTICATION_ERROR', 'Invalid API key or unauthorized');
      }
      if (error.message.includes('429') || error.message.includes('rate limit')) {
        return this.createError('RATE_LIMIT_ERROR', 'Rate limit exceeded. Please try again later.');
      }
      if (error.message.includes('timeout')) {
        return this.createError('TIMEOUT_ERROR', 'Request timed out');
      }
      if (error.message.includes('network') || error.message.includes('fetch')) {
        return this.createError('NETWORK_ERROR', 'Network error. Please check your connection.');
      }

      return this.createError('UNKNOWN_ERROR', error.message);
    }

    return this.createError('UNKNOWN_ERROR', 'An unexpected error occurred');
  }
}

// ----------------------------------------------------------------------------
// Convenience Export
// ----------------------------------------------------------------------------

/**
 * Initialize the Vozia Agent SDK
 */
export function initializeAgent(
  config: AgentConfig,
  options?: {
    features?: Partial<AgentFeatures>;
    theme?: Partial<AgentTheme>;
    isDark?: boolean;
    debug?: boolean;
  }
): AgentClient {
  return AgentClient.initialize(config, options);
}

/**
 * Get the current agent instance
 */
export function getAgent(): AgentClient {
  return AgentClient.getInstance();
}
