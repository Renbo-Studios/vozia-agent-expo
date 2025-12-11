// ============================================================================
// VOZIA AGENT SDK - CONFIGURATION
// ============================================================================

import type { AgentConfig, AgentFeatures, AgentTheme } from '../types';

// ----------------------------------------------------------------------------
// Default Configuration
// ----------------------------------------------------------------------------

/**
 * Default API base URL
 */
export const DEFAULT_BASE_URL = 'https://api.vozia.ai';

/**
 * Default feature flags
 */
export const DEFAULT_FEATURES: AgentFeatures = {
  voice: true,
  tools: true,
  fileUpload: false,
  support: true,
  haptics: true,
  watermark: true,
  offlineMode: true,
  persistence: true,
};

/**
 * Default light theme
 */
export const DEFAULT_LIGHT_THEME: AgentTheme = {
  // Colors
  primaryColor: '#6366F1',
  secondaryColor: '#8B5CF6',
  backgroundColor: '#FFFFFF',
  surfaceColor: '#F9FAFB',
  textColor: '#111827',
  textSecondaryColor: '#6B7280',
  borderColor: '#E5E7EB',
  errorColor: '#EF4444',
  successColor: '#22C55E',

  // Chat bubbles
  userBubbleColor: '#6366F1',
  userBubbleTextColor: '#FFFFFF',
  agentBubbleColor: '#F3F4F6',
  agentBubbleTextColor: '#111827',
  bubbleRadius: 16,

  // Typography
  fontFamily: 'System',
  fontSizeSmall: 12,
  fontSizeMedium: 14,
  fontSizeLarge: 16,

  // Spacing
  spacingXs: 4,
  spacingSm: 8,
  spacingMd: 16,
  spacingLg: 24,
  spacingXl: 32,

  // Components
  buttonRadius: 12,
  inputRadius: 12,
  cardRadius: 16,
  avatarSize: 40,

  // Dark mode
  isDark: false,
};

/**
 * Default dark theme
 */
export const DEFAULT_DARK_THEME: AgentTheme = {
  // Colors
  primaryColor: '#818CF8',
  secondaryColor: '#A78BFA',
  backgroundColor: '#111827',
  surfaceColor: '#1F2937',
  textColor: '#F9FAFB',
  textSecondaryColor: '#9CA3AF',
  borderColor: '#374151',
  errorColor: '#F87171',
  successColor: '#4ADE80',

  // Chat bubbles
  userBubbleColor: '#6366F1',
  userBubbleTextColor: '#FFFFFF',
  agentBubbleColor: '#374151',
  agentBubbleTextColor: '#F9FAFB',
  bubbleRadius: 16,

  // Typography
  fontFamily: 'System',
  fontSizeSmall: 12,
  fontSizeMedium: 14,
  fontSizeLarge: 16,

  // Spacing
  spacingXs: 4,
  spacingSm: 8,
  spacingMd: 16,
  spacingLg: 24,
  spacingXl: 32,

  // Components
  buttonRadius: 12,
  inputRadius: 12,
  cardRadius: 16,
  avatarSize: 40,

  // Dark mode
  isDark: true,
};

// ----------------------------------------------------------------------------
// Configuration Validation
// ----------------------------------------------------------------------------

/**
 * Validate agent configuration
 */
export function validateConfig(config: AgentConfig): void {


  if (!config.agentId || typeof config.agentId !== 'string') {
    throw new Error('AgentConfig: agentId is required and must be a string');
  }

  if (!config.apiKey || typeof config.apiKey !== 'string') {
    throw new Error('AgentConfig: apiKey is required and must be a string');
  }

  if (config.baseUrl && typeof config.baseUrl !== 'string') {
    throw new Error('AgentConfig: baseUrl must be a string');
  }
}

/**
 * Merge user config with defaults
 */
export function mergeConfig(config: AgentConfig): Required<Omit<AgentConfig, 'jwt'>> & Pick<AgentConfig, 'jwt'> {
  return {
    orgId: config.orgId,
    agentId: config.agentId,
    apiKey: config.apiKey,
    baseUrl: config.baseUrl || DEFAULT_BASE_URL,
    userId: config.userId || generateUserId(),
    userMetadata: config.userMetadata || {},
    jwt: config.jwt,
  };
}

/**
 * Merge user features with defaults
 */
export function mergeFeatures(features?: Partial<AgentFeatures>): AgentFeatures {
  return {
    ...DEFAULT_FEATURES,
    ...features,
  };
}

/**
 * Merge user theme with defaults
 */
export function mergeTheme(theme?: Partial<AgentTheme>, isDark = false): AgentTheme {
  const defaultTheme = isDark ? DEFAULT_DARK_THEME : DEFAULT_LIGHT_THEME;
  return {
    ...defaultTheme,
    ...theme,
    isDark,
  };
}

// ----------------------------------------------------------------------------
// Utilities
// ----------------------------------------------------------------------------

/**
 * Generate a unique user ID
 */
function generateUserId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `user_${timestamp}_${randomPart}`;
}

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `session_${timestamp}_${randomPart}`;
}

/**
 * Generate a unique message ID
 */
export function generateMessageId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `msg_${timestamp}_${randomPart}`;
}

// ----------------------------------------------------------------------------
// Storage Keys
// ----------------------------------------------------------------------------

export const STORAGE_KEYS = {
  SESSION_ID: '@vozia/session_id',
  USER_ID: '@vozia/user_id',
  MESSAGES: '@vozia/messages',
  OFFLINE_QUEUE: '@vozia/offline_queue',
  THEME_PREFERENCE: '@vozia/theme_preference',
  CONVERSATION_HISTORY: (sessionId: string) => `@vozia/history/${sessionId}`,
} as const;

// ----------------------------------------------------------------------------
// API Endpoints
// ----------------------------------------------------------------------------

export const API_ENDPOINTS = {
  // Chat
  CHAT: '/api/chat',
  SESSIONS: '/api/chat/sessions',
  SESSION: (id: string) => `/api/chat/sessions/${id}`,
  SESSION_MESSAGES: (id: string) => `/api/chat/sessions/${id}/messages`,

  // Agent
  AGENTS: '/api/agents',
  AGENT: (id: string) => `/api/agents/${id}`,
  AGENT_TEST: (id: string) => `/api/agents/${id}/test`,
  AGENT_TEST_BRAIN: (id: string) => `/api/agents/${id}/test-brain`,
  AGENT_SESSIONS: (id: string) => `/api/agents/${id}/sessions`,
  AGENT_SESSION: (agentId: string, sessionId: string) =>
    `/api/agents/${agentId}/sessions/${sessionId}`,
  AGENT_SESSION_MESSAGE: (agentId: string, sessionId: string) =>
    `/api/agents/${agentId}/sessions/${sessionId}/message`,

  // Voice
  VOICE_TOKEN: '/api/livekit/token',
  VOICE_ROOM: '/api/livekit/room',
  VOICE_START: '/api/livekit/start-session',
  VOICE_JOIN: '/api/livekit/join-session',

  // Tickets
  TICKETS: '/api/tickets',
  TICKET: (id: string) => `/api/tickets/${id}`,
} as const;

// ----------------------------------------------------------------------------
// Constants
// ----------------------------------------------------------------------------

export const CONSTANTS = {
  /** Maximum message length */
  MAX_MESSAGE_LENGTH: 10000,
  /** Maximum file size for uploads (10MB) */
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  /** Reconnection attempts before giving up */
  MAX_RECONNECT_ATTEMPTS: 5,
  /** Base delay for exponential backoff (ms) */
  RECONNECT_BASE_DELAY: 1000,
  /** Maximum reconnect delay (ms) */
  RECONNECT_MAX_DELAY: 30000,
  /** Typing indicator timeout (ms) */
  TYPING_TIMEOUT: 3000,
  /** Network request timeout (ms) */
  REQUEST_TIMEOUT: 30000,
  /** SSE connection timeout (ms) */
  SSE_TIMEOUT: 120000,
  /** Offline queue sync interval (ms) */
  OFFLINE_SYNC_INTERVAL: 5000,
} as const;
