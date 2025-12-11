// ============================================================================
// VOZIA AGENT SDK - VOICE ENTRY POINT
// ============================================================================
//
// Separate entry point for voice-specific functionality
//
// @example
// ```tsx
// import { VoiceAssistantScreen, useVoice } from '@vozia/agent/voice';
// ```
//
// ============================================================================

export {
  useVoice,
  type UseVoiceOptions,
  type UseVoiceReturn,
} from '../hooks/useVoice';

export {
  VoiceService,
  type VoiceServiceConfig,
  type VoiceEvent,
} from '../services/voiceService';

export {
  VoiceAssistantScreen,
  PushToTalkButton,
  VoiceRecordButton,
  WaveformVisualizer,
  MicVisualizer,
  CompactVoiceButton,
  type PushToTalkButtonProps,
  type VoiceRecordButtonProps,
  type WaveformVisualizerProps,
  type MicVisualizerProps,
  type CompactVoiceButtonProps,
} from '../components/voice';

export {
  useVoiceStore,
  selectVoiceState,
  selectIsRecording,
  selectIsPlaying,
  selectAudioLevels,
  selectCurrentLevel,
  selectTranscription,
  selectCanRecord,
} from '../store/voiceStore';

export type {
  VoiceConfig,
  VoiceState,
  VoiceSession,
  AudioLevel,
  VoiceAssistantScreenProps,
} from '../types';
