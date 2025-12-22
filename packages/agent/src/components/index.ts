// ============================================================================
// VOZIA AGENT SDK - COMPONENTS INDEX
// ============================================================================

// Provider
export { AgentProvider, withAgent, type AgentProviderProps, type WithAgentOptions } from './AgentProvider';
export { ThemeProvider, useTheme, createThemedStyles, getContrastColor, adjustBrightness, withOpacity, type ThemeProviderProps } from './ThemeProvider';

// Chat components
export {
  MessageBubble,
  UserMessage,
  AgentMessage,
  TypingIndicator,
  MessageList,
  MessageComposer,
  AgentChat,
  AgentChatBubble,
  type MessageBubbleProps,
  type UserMessageProps,
  type AgentMessageProps,
  type TypingIndicatorProps,
  type MessageListProps,
  type MessageComposerProps,
  type AgentChatBubbleProps,
} from './chat';

// Voice components
export {
  WaveformVisualizer,
  MicVisualizer,
  PushToTalkButton,
  VoiceRecordButton,
  VoiceAssistantScreen,
  CompactVoiceButton,
  type WaveformVisualizerProps,
  type MicVisualizerProps,
  type PushToTalkButtonProps,
  type VoiceRecordButtonProps,
  type CompactVoiceButtonProps,
} from './voice';

// Common components
export {
  AgentButton,
  FloatingButton,
  AgentFAB,
  type FloatingButtonProps,
  type AgentFABProps,
} from './common';

// Support components
export {
  SupportScreen,
  TicketList,
  type SupportScreenProps,
  type TicketListProps,
} from './support';

// Customer Service components
export {
  CustomerServiceButton,
  CustomerServiceSheet,
  CustomerServiceProvider,
  CustomerServiceHome,
  CustomerServiceChat,
  CustomerServiceFAQ,
  CustomerServiceTickets,
  CustomerServiceCall,
  CustomerServiceHeader,
  DEFAULT_LABELS as CUSTOMER_SERVICE_DEFAULT_LABELS,
  SAMPLE_FAQS,
  type CustomerServiceConfig,
  type CustomerServiceButtonProps,
  type CustomerServiceSheetProps,
  type CustomerServiceScreen,
  type CustomerServiceLabels,
  type CustomerServiceTheme,
  type FAQItem,
  type FAQSource,
  type CustomerServiceTicketData,
} from './customerService';
