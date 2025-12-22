// ============================================================================
// VOZIA AGENT SDK - HOOKS INDEX
// ============================================================================

export { useAgent, type UseAgentOptions, type UseAgentReturn } from './useAgent';
export { useChat, type UseChatOptions, type UseChatReturn } from './useChat';
export { useVoice, type UseVoiceOptions, type UseVoiceReturn } from './useVoice';
export {
  useTools,
  type UseToolsOptions,
  type UseToolsReturn,
  getCurrentTimeTool,
  getDeviceInfoTool,
} from './useTools';
export {
  useAgentButton,
  type UseAgentButtonOptions,
  type UseAgentButtonReturn,
} from './useAgentButton';

// Alias for backwards compatibility
export { useAgentButton as useAssistantButton } from './useAgentButton';

// Customer Service
export { useCustomerService } from './useCustomerService';

// Re-export types from customerService
export type {
  UseCustomerServiceOptions,
  UseCustomerServiceReturn,
  CustomerServiceConfig,
  CustomerServiceScreen,
} from '../components/customerService/types';
