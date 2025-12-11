// ============================================================================
// VOZIA AGENT SDK - VOICE STORE (ZUSTAND)
// ============================================================================

import { create } from 'zustand';
import type { VoiceState, VoiceConfig, AudioLevel } from '../types';

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export interface VoiceStoreState {
  // State
  voiceState: VoiceState;
  isInitialized: boolean;

  // Configuration
  config: VoiceConfig;

  // Recording
  isRecording: boolean;
  recordingDuration: number;

  // Audio levels (for visualization)
  audioLevels: AudioLevel[];
  currentLevel: number;

  // Playback
  isPlaying: boolean;
  playbackProgress: number;

  // Transcription
  transcription: string;
  isTranscribing: boolean;

  // Response
  responseText: string;

  // Errors
  error: string | null;
}

export interface VoiceStoreActions {
  // State
  setVoiceState: (state: VoiceState) => void;
  setInitialized: (initialized: boolean) => void;

  // Configuration
  setConfig: (config: Partial<VoiceConfig>) => void;

  // Recording
  startRecording: () => void;
  stopRecording: () => void;
  updateRecordingDuration: (duration: number) => void;

  // Audio levels
  addAudioLevel: (level: AudioLevel) => void;
  setCurrentLevel: (level: number) => void;
  clearAudioLevels: () => void;

  // Playback
  setPlaying: (isPlaying: boolean) => void;
  setPlaybackProgress: (progress: number) => void;

  // Transcription
  setTranscription: (text: string) => void;
  setTranscribing: (isTranscribing: boolean) => void;
  clearTranscription: () => void;

  // Response
  setResponseText: (text: string) => void;
  clearResponseText: () => void;

  // Error
  setError: (error: string | null) => void;

  // Reset
  reset: () => void;
}

export type VoiceStore = VoiceStoreState & VoiceStoreActions;

// ----------------------------------------------------------------------------
// Initial State
// ----------------------------------------------------------------------------

const defaultConfig: VoiceConfig = {
  voiceId: 'Puck',
  pushToTalk: true,
  vadEnabled: false,
  vadSensitivity: 0.5,
  useExpoSpeechFallback: true,
};

const initialState: VoiceStoreState = {
  voiceState: 'idle',
  isInitialized: false,
  config: defaultConfig,
  isRecording: false,
  recordingDuration: 0,
  audioLevels: [],
  currentLevel: 0,
  isPlaying: false,
  playbackProgress: 0,
  transcription: '',
  isTranscribing: false,
  responseText: '',
  error: null,
};

// Maximum audio levels to keep (for visualization)
const MAX_AUDIO_LEVELS = 50;

// ----------------------------------------------------------------------------
// Store
// ----------------------------------------------------------------------------

export const useVoiceStore = create<VoiceStore>((set, get) => ({
  ...initialState,

  // State
  setVoiceState: (voiceState) => {
    set({ voiceState });
  },

  setInitialized: (initialized) => {
    set({ isInitialized: initialized });
  },

  // Configuration
  setConfig: (config) => {
    set((state) => ({
      config: { ...state.config, ...config },
    }));
  },

  // Recording
  startRecording: () => {
    set({
      isRecording: true,
      voiceState: 'recording',
      recordingDuration: 0,
      audioLevels: [],
      transcription: '',
      error: null,
    });
  },

  stopRecording: () => {
    set({
      isRecording: false,
      voiceState: 'processing',
    });
  },

  updateRecordingDuration: (duration) => {
    set({ recordingDuration: duration });
  },

  // Audio levels
  addAudioLevel: (level) => {
    set((state) => {
      const levels = [...state.audioLevels, level];
      // Keep only the last MAX_AUDIO_LEVELS items
      if (levels.length > MAX_AUDIO_LEVELS) {
        levels.shift();
      }
      return {
        audioLevels: levels,
        currentLevel: level.level,
      };
    });
  },

  setCurrentLevel: (level) => {
    set({ currentLevel: level });
  },

  clearAudioLevels: () => {
    set({
      audioLevels: [],
      currentLevel: 0,
    });
  },

  // Playback
  setPlaying: (isPlaying) => {
    set({
      isPlaying,
      voiceState: isPlaying ? 'playing' : 'idle',
    });
  },

  setPlaybackProgress: (progress) => {
    set({ playbackProgress: progress });
  },

  // Transcription
  setTranscription: (text) => {
    set({ transcription: text });
  },

  setTranscribing: (isTranscribing) => {
    set({ isTranscribing });
  },

  clearTranscription: () => {
    set({ transcription: '' });
  },

  // Response
  setResponseText: (text) => {
    set({ responseText: text });
  },

  clearResponseText: () => {
    set({ responseText: '' });
  },

  // Error
  setError: (error) => {
    set({
      error,
      voiceState: error ? 'error' : get().voiceState,
    });
  },

  // Reset
  reset: () => {
    set(initialState);
  },
}));

// ----------------------------------------------------------------------------
// Selectors
// ----------------------------------------------------------------------------

export const selectVoiceState = (state: VoiceStore) => state.voiceState;
export const selectIsInitialized = (state: VoiceStore) => state.isInitialized;
export const selectConfig = (state: VoiceStore) => state.config;
export const selectIsRecording = (state: VoiceStore) => state.isRecording;
export const selectRecordingDuration = (state: VoiceStore) => state.recordingDuration;
export const selectAudioLevels = (state: VoiceStore) => state.audioLevels;
export const selectCurrentLevel = (state: VoiceStore) => state.currentLevel;
export const selectIsPlaying = (state: VoiceStore) => state.isPlaying;
export const selectPlaybackProgress = (state: VoiceStore) => state.playbackProgress;
export const selectTranscription = (state: VoiceStore) => state.transcription;
export const selectIsTranscribing = (state: VoiceStore) => state.isTranscribing;
export const selectResponseText = (state: VoiceStore) => state.responseText;
export const selectError = (state: VoiceStore) => state.error;

// Compound selectors
export const selectIsActive = (state: VoiceStore) =>
  state.voiceState === 'recording' || state.voiceState === 'playing';

export const selectIsBusy = (state: VoiceStore) =>
  state.voiceState !== 'idle' && state.voiceState !== 'error';

export const selectCanRecord = (state: VoiceStore) =>
  state.isInitialized && (state.voiceState === 'idle' || state.voiceState === 'error');
