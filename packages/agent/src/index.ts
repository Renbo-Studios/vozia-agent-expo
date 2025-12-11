// ============================================================================
// VOZIA AGENT SDK - MAIN ENTRY POINT
// ============================================================================
//
// A comprehensive Expo/React Native SDK for integrating Vozia AI agents
// with chat, voice, tools, and support functionality.
//
// @example
// ```tsx
// import { AgentProvider, AgentChat, useAgent } from '@vozia/agent';
//
// function App() {
//   return (
//     <AgentProvider
//       config={{
//         orgId: 'your-org-id',
//         assistantId: 'your-assistant-id',
//         apiKey: 'your-api-key',
//       }}
//       features={{ voice: true, tools: true }}
//     >
//       <AgentChat />
//     </AgentProvider>
//   );
// }
// ```
//
// ============================================================================

// ----------------------------------------------------------------------------
// Core
// ----------------------------------------------------------------------------

export {
  AgentClient,
  initializeAgent,
  getAgent,
  DEFAULT_BASE_URL,
  DEFAULT_FEATURES,
  DEFAULT_LIGHT_THEME,
  DEFAULT_DARK_THEME,
  generateSessionId,
  generateMessageId,
  CONSTANTS,
} from './core';

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export type {
  // Configuration
  AgentConfig,
  AgentFeatures,
  AgentProviderConfig,

  // Theme
  AgentTheme,

  // Messages
  Message,
  MessageRole,
  MessageStatus,
  MessageMetadata,
  Attachment,

  // Session
  Session,
  SessionStatus,

  // Events
  AgentEvent,
  AgentEventHandler,
  StreamEvent,

  // Tools
  ToolDefinition,
  ToolParameterSchema,
  ToolCall,
  ToolResult,

  // Voice
  VoiceConfig,
  VoiceState,
  VoiceSession,
  AudioLevel,

  // Support
  Ticket,
  TicketPriority,
  TicketStatus,
  CreateTicketData,

  // Errors
  AgentError,
  AgentErrorCode,

  // Connection
  ConnectionStatus,
  NetworkState,

  // Storage
  StorageAdapter,

  // API
  ApiResponse,
  ChatResponse,

  // Component Props
  StyleProps,
  BaseComponentProps,
  ButtonPosition,
  AssistantButtonProps,
  AgentChatProps,
  VoiceAssistantScreenProps,
} from './types';

// ----------------------------------------------------------------------------
// Hooks
// ----------------------------------------------------------------------------

export {
  useAgent,
  useChat,
  useVoice,
  useTools,
  useAssistantButton,
  getCurrentTimeTool,
  getDeviceInfoTool,
  type UseAgentOptions,
  type UseAgentReturn,
  type UseChatOptions,
  type UseChatReturn,
  type UseVoiceOptions,
  type UseVoiceReturn,
  type UseToolsOptions,
  type UseToolsReturn,
  type UseAssistantButtonOptions,
  type UseAssistantButtonReturn,
} from './hooks';

// ----------------------------------------------------------------------------
// Components
// ----------------------------------------------------------------------------

export {
  // Provider
  AgentProvider,
  withAgent,
  ThemeProvider,
  useTheme,

  // Chat
  AgentChat,
  AgentChatBubble,
  MessageList,
  MessageComposer,
  MessageBubble,
  UserMessage,
  AgentMessage,
  TypingIndicator,

  // Voice
  VoiceAssistantScreen,
  PushToTalkButton,
  VoiceRecordButton,
  WaveformVisualizer,
  MicVisualizer,
  CompactVoiceButton,

  // Common
  AssistantButton,
  AssistantFAB,
  FloatingButton,

  // Support
  SupportScreen,
  TicketList,

  // Theme utilities
  createThemedStyles,
  getContrastColor,
  adjustBrightness,
  withOpacity,

  // Types
  type AgentProviderProps,
  type WithAgentOptions,
  type ThemeProviderProps,
  type MessageListProps,
  type MessageComposerProps,
  type MessageBubbleProps,
  type UserMessageProps,
  type AgentMessageProps,
  type TypingIndicatorProps,
  type AgentChatBubbleProps,
  type PushToTalkButtonProps,
  type VoiceRecordButtonProps,
  type WaveformVisualizerProps,
  type MicVisualizerProps,
  type CompactVoiceButtonProps,
  type FloatingButtonProps,
  type AssistantFABProps,
  type SupportScreenProps,
  type TicketListProps,
} from './components';

// ----------------------------------------------------------------------------
// Store (for advanced usage)
// ----------------------------------------------------------------------------

export {
  useAgentStore,
  useChatStore,
  useVoiceStore,
  useToolsStore,
} from './store';

// ----------------------------------------------------------------------------
// Services (for advanced usage)
// ----------------------------------------------------------------------------

export {
  HttpClient,
  StreamingService,
  WebSocketClient,
  VoiceService,
  StorageService,
} from './services';

// ----------------------------------------------------------------------------
// Utilities
// ----------------------------------------------------------------------------

export { EventEmitter } from './utils';
