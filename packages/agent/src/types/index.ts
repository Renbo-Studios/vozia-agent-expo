// ============================================================================
// VOZIA AGENT SDK - TYPE DEFINITIONS
// ============================================================================

// ----------------------------------------------------------------------------
// Configuration Types
// ----------------------------------------------------------------------------

/**
 * Main configuration for initializing the Vozia Agent SDK
 */
export interface AgentConfig {
  /** Organization ID from your Vozia dashboard */
  orgId: string;
  /** Assistant/Agent ID to connect to */
  assistantId: string;
  /** API key for authentication */
  apiKey: string;
  /** Base URL for the Vozia API (optional, defaults to production) */
  baseUrl?: string;
  /** End user ID for tracking conversations */
  userId?: string;
  /** Additional user metadata */
  userMetadata?: Record<string, unknown>;
  /** Optional JWT token for authenticated sessions */
  jwt?: string;
}

/**
 * Feature flags to enable/disable SDK capabilities
 */
export interface AgentFeatures {
  /** Enable voice input/output */
  voice?: boolean;
  /** Enable custom tools */
  tools?: boolean;
  /** Enable file uploads */
  fileUpload?: boolean;
  /** Enable support/ticketing features */
  support?: boolean;
  /** Enable haptic feedback */
  haptics?: boolean;
  /** Show watermark/branding */
  watermark?: boolean;
  /** Enable offline message queueing */
  offlineMode?: boolean;
  /** Enable conversation persistence */
  persistence?: boolean;
}

/**
 * Full SDK initialization options
 */
export interface AgentProviderConfig {
  /** Core agent configuration */
  config: AgentConfig;
  /** Feature toggles */
  features?: AgentFeatures;
  /** Theme customization */
  theme?: Partial<AgentTheme>;
  /** Debug mode for extra logging */
  debug?: boolean;
}

// ----------------------------------------------------------------------------
// Theme Types
// ----------------------------------------------------------------------------

/**
 * Complete theme configuration for UI customization
 */
export interface AgentTheme {
  // Colors
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  textSecondaryColor: string;
  borderColor: string;
  errorColor: string;
  successColor: string;

  // Chat bubbles
  userBubbleColor: string;
  userBubbleTextColor: string;
  agentBubbleColor: string;
  agentBubbleTextColor: string;
  bubbleRadius: number;

  // Typography
  fontFamily: string;
  fontSizeSmall: number;
  fontSizeMedium: number;
  fontSizeLarge: number;

  // Spacing
  spacingXs: number;
  spacingSm: number;
  spacingMd: number;
  spacingLg: number;
  spacingXl: number;

  // Components
  buttonRadius: number;
  inputRadius: number;
  cardRadius: number;
  avatarSize: number;

  // Dark mode
  isDark: boolean;
}

// ----------------------------------------------------------------------------
// Message Types
// ----------------------------------------------------------------------------

/**
 * Message role in the conversation
 */
export type MessageRole = 'user' | 'assistant' | 'system';

/**
 * Message status for tracking delivery
 */
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'error';

/**
 * Metadata attached to messages
 */
export interface MessageMetadata {
  /** Sources used for RAG responses */
  sources?: Array<{
    content: string;
    similarity: number;
    documentId?: string;
    documentName?: string;
  }>;
  /** Tools used to generate the response */
  toolsUsed?: string[];
  /** Processing iterations */
  iterations?: number;
  /** Whether handoff was requested */
  handoffRequested?: boolean;
  /** Custom metadata */
  custom?: Record<string, unknown>;
}

/**
 * Chat message structure
 */
export interface Message {
  /** Unique message ID */
  id: string;
  /** Message role */
  role: MessageRole;
  /** Message content (text) */
  content: string;
  /** When the message was created */
  timestamp: Date;
  /** Message delivery status */
  status: MessageStatus;
  /** Additional metadata */
  metadata?: MessageMetadata;
  /** Attachments (files, images) */
  attachments?: Attachment[];
}

/**
 * File attachment
 */
export interface Attachment {
  id: string;
  type: 'image' | 'file' | 'audio';
  url: string;
  name: string;
  size?: number;
  mimeType?: string;
}

// ----------------------------------------------------------------------------
// Session Types
// ----------------------------------------------------------------------------

/**
 * Session status
 */
export type SessionStatus = 'active' | 'completed' | 'abandoned';

/**
 * Chat session information
 */
export interface Session {
  /** Unique session ID */
  id: string;
  /** Associated assistant ID */
  assistantId: string;
  /** End user ID */
  endUserId?: string;
  /** Session status */
  status: SessionStatus;
  /** When the session started */
  startedAt: Date;
  /** When the session ended (if applicable) */
  endedAt?: Date;
  /** Total message count */
  messageCount: number;
  /** Whether human handoff was requested */
  handoffRequested: boolean;
  /** Custom session metadata */
  metadata?: Record<string, unknown>;
}

// ----------------------------------------------------------------------------
// Event Types
// ----------------------------------------------------------------------------

/**
 * Events emitted by the agent during conversations
 */
export type AgentEvent =
  | { type: 'connected' }
  | { type: 'disconnected'; reason?: string }
  | { type: 'reconnecting'; attempt: number }
  | { type: 'message'; message: Message }
  | { type: 'typing_start' }
  | { type: 'typing_end' }
  | { type: 'thinking'; message: string }
  | { type: 'token'; content: string }
  | { type: 'tool_call'; tool: ToolCall }
  | { type: 'tool_result'; tool: string; result: unknown }
  | { type: 'handoff_requested'; reason?: string }
  | { type: 'session_created'; session: Session }
  | { type: 'session_ended'; session: Session }
  | { type: 'error'; error: AgentError };

/**
 * Event handler function type
 */
export type AgentEventHandler<T extends AgentEvent['type']> = (
  event: Extract<AgentEvent, { type: T }>
) => void;

// ----------------------------------------------------------------------------
// Tool Types
// ----------------------------------------------------------------------------

/**
 * Tool parameter schema (JSON Schema subset)
 */
export interface ToolParameterSchema {
  type: 'object';
  properties: Record<string, {
    type: string;
    description?: string;
    enum?: string[];
    default?: unknown;
  }>;
  required?: string[];
}

/**
 * Tool definition for registration
 */
export interface ToolDefinition {
  /** Unique tool name */
  name: string;
  /** Description for the AI to understand when to use */
  description: string;
  /** Parameter schema */
  parameters: ToolParameterSchema;
  /** Handler function */
  handler: (params: Record<string, unknown>) => Promise<unknown>;
}

/**
 * Tool call from the agent
 */
export interface ToolCall {
  /** Tool call ID */
  id: string;
  /** Tool name */
  name: string;
  /** Arguments passed to the tool */
  arguments: Record<string, unknown>;
  /** Timestamp */
  timestamp: Date;
}

/**
 * Tool execution result
 */
export interface ToolResult {
  /** Tool call ID */
  callId: string;
  /** Tool name */
  name: string;
  /** Result data */
  result: unknown;
  /** Error if failed */
  error?: string;
  /** Execution duration in ms */
  duration: number;
}

// ----------------------------------------------------------------------------
// Voice Types
// ----------------------------------------------------------------------------

/**
 * Voice state during recording/playback
 */
export type VoiceState =
  | 'idle'
  | 'recording'
  | 'processing'
  | 'playing'
  | 'error';

/**
 * Voice configuration
 */
export interface VoiceConfig {
  /** Voice ID for TTS (agent-side) */
  voiceId?: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Aoede';
  /** Enable push-to-talk mode (vs tap-to-toggle) */
  pushToTalk?: boolean;
  /** Enable voice activity detection */
  vadEnabled?: boolean;
  /** VAD sensitivity (0-1) */
  vadSensitivity?: number;
  /** Use Expo Speech fallback for TTS */
  useExpoSpeechFallback?: boolean;
}

/**
 * Audio level data for visualization
 */
export interface AudioLevel {
  /** Current audio level (0-1) */
  level: number;
  /** Timestamp */
  timestamp: number;
}

/**
 * Voice session information
 */
export interface VoiceSession {
  /** Session ID */
  id: string;
  /** Room name (for WebRTC) */
  roomName?: string;
  /** Session state */
  state: VoiceState;
  /** Duration in seconds */
  duration: number;
  /** Started at timestamp */
  startedAt?: Date;
}

// ----------------------------------------------------------------------------
// Support/Ticket Types
// ----------------------------------------------------------------------------

/**
 * Ticket priority
 */
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Ticket status
 */
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

/**
 * Support ticket
 */
export interface Ticket {
  /** Ticket ID */
  id: string;
  /** Subject/title */
  subject: string;
  /** Description */
  description: string;
  /** Priority level */
  priority: TicketPriority;
  /** Current status */
  status: TicketStatus;
  /** Category */
  category?: string;
  /** Created at */
  createdAt: Date;
  /** Updated at */
  updatedAt: Date;
  /** Associated session ID */
  sessionId?: string;
  /** End user info */
  endUser?: {
    id?: string;
    name?: string;
    email?: string;
  };
}

/**
 * Ticket creation data
 */
export interface CreateTicketData {
  subject: string;
  description: string;
  priority?: TicketPriority;
  category?: string;
  email?: string;
  name?: string;
}

// ----------------------------------------------------------------------------
// Error Types
// ----------------------------------------------------------------------------

/**
 * Error codes for SDK errors
 */
export type AgentErrorCode =
  | 'INITIALIZATION_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'RATE_LIMIT_ERROR'
  | 'INVALID_CONFIG'
  | 'SESSION_ERROR'
  | 'TOOL_ERROR'
  | 'VOICE_ERROR'
  | 'STORAGE_ERROR'
  | 'UNKNOWN_ERROR';

/**
 * SDK error structure
 */
export interface AgentError {
  /** Error code */
  code: AgentErrorCode;
  /** Human-readable message */
  message: string;
  /** Original error (if any) */
  cause?: Error;
  /** Additional context */
  context?: Record<string, unknown>;
}

// ----------------------------------------------------------------------------
// Connection Types
// ----------------------------------------------------------------------------

/**
 * Connection status
 */
export type ConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'error';

/**
 * Network state information
 */
export interface NetworkState {
  /** Current connection status */
  status: ConnectionStatus;
  /** Last successful connection */
  lastConnected?: Date;
  /** Reconnection attempts */
  reconnectAttempts: number;
  /** Is online */
  isOnline: boolean;
  /** Queued messages (offline mode) */
  queuedMessages: number;
}

// ----------------------------------------------------------------------------
// Storage Types
// ----------------------------------------------------------------------------

/**
 * Storage adapter interface for persistence
 */
export interface StorageAdapter {
  /** Get item from storage */
  getItem(key: string): Promise<string | null>;
  /** Set item in storage */
  setItem(key: string, value: string): Promise<void>;
  /** Remove item from storage */
  removeItem(key: string): Promise<void>;
  /** Get all keys */
  getAllKeys(): Promise<string[]>;
  /** Clear all storage */
  clear(): Promise<void>;
}

// ----------------------------------------------------------------------------
// API Response Types
// ----------------------------------------------------------------------------

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Chat response from the API
 */
export interface ChatResponse {
  sessionId: string;
  response: string;
  sources?: Array<{
    content: string;
    similarity: number;
  }>;
  toolsUsed?: string[];
  metadata?: {
    iterations: number;
    handoff?: boolean;
  };
}

/**
 * Streaming event from SSE
 */
export interface StreamEvent {
  type: 'thinking' | 'token' | 'complete' | 'error';
  content?: string;
  message?: string;
  sessionId?: string;
  iterations?: number;
  handoff?: boolean;
  code?: string;
}

// ----------------------------------------------------------------------------
// Component Props Types
// ----------------------------------------------------------------------------

/**
 * Common component style props
 */
export interface StyleProps {
  style?: Record<string, unknown>;
  className?: string;
}

/**
 * Base component props with testID
 */
export interface BaseComponentProps extends StyleProps {
  testID?: string;
}

/**
 * Floating button position
 */
export type ButtonPosition =
  | 'bottom-right'
  | 'bottom-left'
  | 'top-right'
  | 'top-left';

/**
 * Assistant button props
 */
export interface AssistantButtonProps extends BaseComponentProps {
  /** Button position on screen */
  position?: ButtonPosition;
  /** Custom icon */
  icon?: React.ReactNode;
  /** Button size */
  size?: number;
  /** Enable haptic feedback */
  hapticFeedback?: boolean;
  /** Custom press handler (overrides default modal) */
  onPress?: () => void;
}

/**
 * Chat component props
 */
export interface AgentChatProps extends BaseComponentProps {
  /** Initial message to display */
  initialMessage?: string;
  /** Placeholder text for input */
  placeholder?: string;
  /** Show header */
  showHeader?: boolean;
  /** Header title */
  headerTitle?: string;
  /** Show avatar in messages */
  showAvatar?: boolean;
  /** Custom avatar URL */
  avatarUrl?: string;
  /** Enable voice input */
  enableVoice?: boolean;
  /** Enable attachments */
  enableAttachments?: boolean;
  /** Called when message is sent */
  onSendMessage?: (message: string) => void;
  /** Called when session closes */
  onClose?: () => void;
}

/**
 * Voice assistant screen props
 */
export interface VoiceAssistantScreenProps extends BaseComponentProps {
  /** Voice configuration */
  voiceConfig?: VoiceConfig;
  /** Show transcript */
  showTranscript?: boolean;
  /** Custom waveform colors */
  waveformColor?: string;
  /** Called when voice session ends */
  onSessionEnd?: () => void;
}
