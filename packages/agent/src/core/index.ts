// ============================================================================
// VOZIA AGENT SDK - CORE INDEX
// ============================================================================

export {
  AgentClient,
  initializeAgent,
  getAgent,
} from './AgentClient';

export {
  DEFAULT_BASE_URL,
  DEFAULT_FEATURES,
  DEFAULT_LIGHT_THEME,
  DEFAULT_DARK_THEME,
  validateConfig,
  mergeConfig,
  mergeFeatures,
  mergeTheme,
  generateSessionId,
  generateMessageId,
  STORAGE_KEYS,
  API_ENDPOINTS,
  CONSTANTS,
} from './config';
