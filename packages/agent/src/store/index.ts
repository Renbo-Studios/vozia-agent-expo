// ============================================================================
// VOZIA AGENT SDK - STORES INDEX
// ============================================================================

export {
  useAgentStore,
  selectConfig,
  selectFeatures,
  selectTheme,
  selectIsInitialized,
  selectConnectionStatus,
  selectLastError,
  selectCurrentSessionId,
  selectDebug,
  selectIsConnected,
  selectIsReady,
  type AgentState,
  type AgentActions,
  type AgentStore,
} from './agentStore';

export {
  useChatStore,
  selectMessages,
  selectIsTyping,
  selectIsSending,
  selectIsLoading,
  selectStreamingContent,
  selectIsStreaming,
  selectInputText,
  selectSendError,
  selectLastMessage,
  selectMessageCount,
  selectCanSend,
  selectDisplayContent,
  type ChatState,
  type ChatActions,
  type ChatStore,
} from './chatStore';

export {
  useVoiceStore,
  selectVoiceState,
  selectIsInitialized as selectVoiceIsInitialized,
  selectConfig as selectVoiceConfig,
  selectIsRecording,
  selectRecordingDuration,
  selectAudioLevels,
  selectCurrentLevel,
  selectIsPlaying,
  selectPlaybackProgress,
  selectTranscription,
  selectIsTranscribing,
  selectResponseText,
  selectError as selectVoiceError,
  selectIsActive,
  selectIsBusy,
  selectCanRecord,
  type VoiceStoreState,
  type VoiceStoreActions,
  type VoiceStore,
} from './voiceStore';

export {
  useToolsStore,
  selectTools,
  selectToolsArray,
  selectActiveCalls,
  selectCallHistory,
  selectIsExecuting,
  selectCurrentCall,
  selectTool,
  selectToolNames,
  selectRecentResults,
  selectHasTool,
  type ToolsState,
  type ToolsActions,
  type ToolsStore,
} from './toolsStore';
