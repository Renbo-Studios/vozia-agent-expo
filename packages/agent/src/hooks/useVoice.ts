// ============================================================================
// VOZIA AGENT SDK - useVoice HOOK
// ============================================================================

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useVoiceStore } from '../store/voiceStore';
import { useAgentStore } from '../store/agentStore';
import { useChatStore } from '../store/chatStore';
import { VoiceService } from '../services/voiceService';
import { HttpClient } from '../services/httpClient';
import type { VoiceConfig, VoiceState, AudioLevel, AgentError } from '../types';

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export interface UseVoiceOptions {
  /** Voice configuration */
  config?: Partial<VoiceConfig>;
  /** Called when recording starts */
  onRecordingStart?: () => void;
  /** Called when recording stops */
  onRecordingStop?: (duration: number) => void;
  /** Called when transcription is received */
  onTranscription?: (text: string, isFinal: boolean) => void;
  /** Called when response audio starts playing */
  onResponseStart?: () => void;
  /** Called when response audio finishes */
  onResponseEnd?: (text: string) => void;
  /** Called on error */
  onError?: (error: AgentError) => void;
}

export interface UseVoiceReturn {
  // State
  state: VoiceState;
  isInitialized: boolean;
  isRecording: boolean;
  isPlaying: boolean;
  isProcessing: boolean;
  isBusy: boolean;
  canRecord: boolean;

  // Recording
  recordingDuration: number;
  audioLevels: AudioLevel[];
  currentLevel: number;

  // Transcription & Response
  transcription: string;
  responseText: string;

  // Error
  error: string | null;

  // Configuration
  config: VoiceConfig;

  // Actions
  initialize: () => Promise<void>;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  toggleRecording: () => Promise<void>;
  sendVoiceMessage: () => Promise<string | null>;
  playAudio: (uri: string) => Promise<void>;
  stopPlayback: () => Promise<void>;
  speakText: (text: string) => Promise<void>;
  setConfig: (config: Partial<VoiceConfig>) => void;
  reset: () => void;
}

// ----------------------------------------------------------------------------
// Hook
// ----------------------------------------------------------------------------

/**
 * Hook for voice functionality with the Vozia Agent
 */
export function useVoice(options: UseVoiceOptions = {}): UseVoiceReturn {
  const voiceServiceRef = useRef<VoiceService | null>(null);
  const recordingStartTimeRef = useRef<number>(0);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Voice store state
  const state = useVoiceStore((s) => s.voiceState);
  const isInitialized = useVoiceStore((s) => s.isInitialized);
  const isRecording = useVoiceStore((s) => s.isRecording);
  const isPlaying = useVoiceStore((s) => s.isPlaying);
  const recordingDuration = useVoiceStore((s) => s.recordingDuration);
  const audioLevels = useVoiceStore((s) => s.audioLevels);
  const currentLevel = useVoiceStore((s) => s.currentLevel);
  const transcription = useVoiceStore((s) => s.transcription);
  const responseText = useVoiceStore((s) => s.responseText);
  const error = useVoiceStore((s) => s.error);
  const voiceConfig = useVoiceStore((s) => s.config);

  // Voice store actions
  const setInitialized = useVoiceStore((s) => s.setInitialized);
  const setVoiceState = useVoiceStore((s) => s.setVoiceState);
  const startRecordingStore = useVoiceStore((s) => s.startRecording);
  const stopRecordingStore = useVoiceStore((s) => s.stopRecording);
  const updateRecordingDuration = useVoiceStore((s) => s.updateRecordingDuration);
  const addAudioLevel = useVoiceStore((s) => s.addAudioLevel);
  const clearAudioLevels = useVoiceStore((s) => s.clearAudioLevels);
  const setPlaying = useVoiceStore((s) => s.setPlaying);
  const setTranscription = useVoiceStore((s) => s.setTranscription);
  const setResponseText = useVoiceStore((s) => s.setResponseText);
  const setError = useVoiceStore((s) => s.setError);
  const setConfigStore = useVoiceStore((s) => s.setConfig);
  const resetStore = useVoiceStore((s) => s.reset);

  // Agent store
  const agentConfig = useAgentStore((s) => s.config);
  const features = useAgentStore((s) => s.features);
  const debug = useAgentStore((s) => s.debug);

  // Chat store for adding messages
  const addMessage = useChatStore((s) => s.addMessage);

  // Computed
  const isProcessing = state === 'processing';
  const isBusy = state !== 'idle' && state !== 'error';
  const canRecord = isInitialized && (state === 'idle' || state === 'error');

  // Initialize voice service
  const initialize = useCallback(async () => {
    if (!features.voice) {
      setError('Voice feature is disabled');
      return;
    }

    if (!agentConfig) {
      setError('Agent not initialized');
      return;
    }

    try {
      const httpClient = new HttpClient({
        baseUrl: agentConfig.baseUrl || 'https://api.vozia.ai',
        apiKey: agentConfig.apiKey,
        jwt: agentConfig.jwt,
        debug,
      });

      voiceServiceRef.current = new VoiceService({
        httpClient,
        assistantId: agentConfig.assistantId,
        userId: agentConfig.userId,
        voiceConfig: { ...voiceConfig, ...options.config },
        debug,
      });

      // Setup event listeners
      voiceServiceRef.current.on('state_change', (event) => {
        setVoiceState(event.state);
      });

      voiceServiceRef.current.on('audio_level', (event) => {
        addAudioLevel(event.level);
      });

      voiceServiceRef.current.on('transcription', (event) => {
        setTranscription(event.text);
        options.onTranscription?.(event.text, event.isFinal);
      });

      voiceServiceRef.current.on('response_start', () => {
        options.onResponseStart?.();
      });

      voiceServiceRef.current.on('response_end', (event) => {
        setResponseText(event.text);
        options.onResponseEnd?.(event.text);
      });

      voiceServiceRef.current.on('error', (event) => {
        setError(event.error.message);
        options.onError?.(event.error);
      });

      await voiceServiceRef.current.initialize();
      setInitialized(true);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize voice';
      setError(errorMessage);
      options.onError?.({ code: 'VOICE_ERROR', message: errorMessage });
    }
  }, [
    features.voice,
    agentConfig,
    voiceConfig,
    options,
    debug,
    setInitialized,
    setVoiceState,
    addAudioLevel,
    setTranscription,
    setResponseText,
    setError,
  ]);

  // Start recording
  const startRecording = useCallback(async () => {
    if (!voiceServiceRef.current) {
      await initialize();
    }

    if (!voiceServiceRef.current || !canRecord) {
      return;
    }

    try {
      startRecordingStore();
      clearAudioLevels();
      recordingStartTimeRef.current = Date.now();

      // Start duration timer
      durationIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - recordingStartTimeRef.current;
        updateRecordingDuration(elapsed);
      }, 100);

      await voiceServiceRef.current.startRecording();
      options.onRecordingStart?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start recording');
    }
  }, [
    initialize,
    canRecord,
    startRecordingStore,
    clearAudioLevels,
    updateRecordingDuration,
    setError,
    options,
  ]);

  // Stop recording
  const stopRecording = useCallback(async () => {
    if (!voiceServiceRef.current || !isRecording) {
      return;
    }

    // Clear duration timer
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    stopRecordingStore();
    const result = await voiceServiceRef.current.stopRecording();

    if (result) {
      options.onRecordingStop?.(result.duration);
    }
  }, [isRecording, stopRecordingStore, options]);

  // Toggle recording (for tap-to-toggle mode)
  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  // Send recorded voice message
  const sendVoiceMessage = useCallback(async (): Promise<string | null> => {
    if (!voiceServiceRef.current) {
      return null;
    }

    try {
      // Stop recording if still recording
      if (isRecording) {
        await stopRecording();
      }

      // Get recorded audio URI
      const result = await voiceServiceRef.current.stopRecording();
      if (!result) {
        return null;
      }

      // Send to backend
      const response = await voiceServiceRef.current.sendVoiceMessage(result.uri);

      // Add messages to chat
      if (transcription) {
        addMessage({
          role: 'user',
          content: transcription,
        });
      }

      if (response) {
        addMessage({
          role: 'assistant',
          content: response,
        });
      }

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send voice message';
      setError(errorMessage);
      return null;
    }
  }, [isRecording, stopRecording, transcription, addMessage, setError]);

  // Play audio
  const playAudio = useCallback(async (uri: string) => {
    if (!voiceServiceRef.current) {
      await initialize();
    }

    if (voiceServiceRef.current) {
      await voiceServiceRef.current.playAudio(uri);
    }
  }, [initialize]);

  // Stop playback
  const stopPlayback = useCallback(async () => {
    if (voiceServiceRef.current) {
      await voiceServiceRef.current.stopPlayback();
    }
  }, []);

  // Speak text using TTS
  const speakText = useCallback(async (text: string) => {
    if (!voiceServiceRef.current) {
      await initialize();
    }

    if (voiceServiceRef.current) {
      await voiceServiceRef.current.speakText(text);
    }
  }, [initialize]);

  // Set config
  const setConfig = useCallback(
    (config: Partial<VoiceConfig>) => {
      setConfigStore(config);
    },
    [setConfigStore]
  );

  // Reset
  const reset = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
    voiceServiceRef.current?.destroy();
    voiceServiceRef.current = null;
    resetStore();
  }, [resetStore]);

  // Apply initial config
  useEffect(() => {
    if (options.config) {
      setConfigStore(options.config);
    }
  }, [options.config, setConfigStore]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      voiceServiceRef.current?.destroy();
    };
  }, []);

  return useMemo(
    () => ({
      // State
      state,
      isInitialized,
      isRecording,
      isPlaying,
      isProcessing,
      isBusy,
      canRecord,

      // Recording
      recordingDuration,
      audioLevels,
      currentLevel,

      // Transcription & Response
      transcription,
      responseText,

      // Error
      error,

      // Configuration
      config: voiceConfig,

      // Actions
      initialize,
      startRecording,
      stopRecording,
      toggleRecording,
      sendVoiceMessage,
      playAudio,
      stopPlayback,
      speakText,
      setConfig,
      reset,
    }),
    [
      state,
      isInitialized,
      isRecording,
      isPlaying,
      isProcessing,
      isBusy,
      canRecord,
      recordingDuration,
      audioLevels,
      currentLevel,
      transcription,
      responseText,
      error,
      voiceConfig,
      initialize,
      startRecording,
      stopRecording,
      toggleRecording,
      sendVoiceMessage,
      playAudio,
      stopPlayback,
      speakText,
      setConfig,
      reset,
    ]
  );
}
