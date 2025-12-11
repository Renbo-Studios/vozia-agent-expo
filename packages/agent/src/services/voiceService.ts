// ============================================================================
// VOZIA AGENT SDK - VOICE SERVICE
// ============================================================================

import type {
  AgentError,
  VoiceConfig,
  VoiceState,
  VoiceSession,
  AudioLevel,
} from '../types';
import { HttpClient } from './httpClient';
import { API_ENDPOINTS } from '../core/config';
import { EventEmitter } from '../utils/eventEmitter';

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export interface VoiceServiceConfig {
  httpClient: HttpClient;
  assistantId: string;
  userId?: string;
  voiceConfig?: VoiceConfig;
  debug?: boolean;
}

export type VoiceEvent =
  | { type: 'state_change'; state: VoiceState; previousState: VoiceState }
  | { type: 'recording_start' }
  | { type: 'recording_stop'; duration: number }
  | { type: 'audio_level'; level: AudioLevel }
  | { type: 'transcription'; text: string; isFinal: boolean }
  | { type: 'response_start' }
  | { type: 'response_audio'; data: ArrayBuffer }
  | { type: 'response_end'; text: string }
  | { type: 'error'; error: AgentError };

// Audio recording and playback are handled via expo-av
// These type definitions ensure compatibility
interface AudioRecording {
  prepareToRecordAsync: (options: unknown) => Promise<void>;
  startAsync: () => Promise<void>;
  stopAndUnloadAsync: () => Promise<void>;
  getURI: () => string | null;
  getStatusAsync: () => Promise<{ durationMillis: number }>;
  setOnRecordingStatusUpdate: (callback: (status: { metering?: number }) => void) => void;
}

interface AudioSound {
  loadAsync: (source: { uri: string }) => Promise<void>;
  playAsync: () => Promise<void>;
  stopAsync: () => Promise<void>;
  unloadAsync: () => Promise<void>;
  setOnPlaybackStatusUpdate: (callback: (status: { didJustFinish?: boolean }) => void) => void;
}

// ----------------------------------------------------------------------------
// Voice Service
// ----------------------------------------------------------------------------

/**
 * Voice service for audio recording, playback, and voice interactions
 * Works with expo-av for Expo compatibility
 */
export class VoiceService {
  private config: VoiceServiceConfig;
  private eventEmitter: EventEmitter<VoiceEvent>;
  private state: VoiceState = 'idle';
  private recording: AudioRecording | null = null;
  private playback: AudioSound | null = null;
  private currentSession: VoiceSession | null = null;
  private audioLevelInterval: ReturnType<typeof setInterval> | null = null;

  // Expo-av modules (lazy loaded)
  private Audio: typeof import('expo-av').Audio | null = null;

  constructor(config: VoiceServiceConfig) {
    this.config = config;
    this.eventEmitter = new EventEmitter<VoiceEvent>();
  }

  // --------------------------------------------------------------------------
  // Public Methods
  // --------------------------------------------------------------------------

  /**
   * Initialize audio permissions and modules
   */
  async initialize(): Promise<void> {
    try {
      // Dynamically import expo-av
      const ExpoAV = await import('expo-av');
      this.Audio = ExpoAV.Audio;

      // Request permissions
      const { status } = await this.Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Audio recording permission not granted');
      }

      // Configure audio mode
      await this.Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      this.log('Voice service initialized');
    } catch (error) {
      this.log('Failed to initialize voice service', { error }, 'error');
      throw this.createError('VOICE_ERROR', 'Failed to initialize audio');
    }
  }

  /**
   * Start recording audio
   */
  async startRecording(): Promise<void> {
    if (!this.Audio) {
      await this.initialize();
    }

    if (this.state === 'recording') {
      this.log('Already recording', {}, 'warn');
      return;
    }

    this.log('Starting recording');
    this.setState('recording');

    try {
      const { Recording } = this.Audio!;
      this.recording = new Recording() as unknown as AudioRecording;

      await this.recording.prepareToRecordAsync({
        android: {
          extension: '.wav',
          outputFormat: 'DEFAULT',
          audioEncoder: 'DEFAULT',
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          outputFormat: 'linearPCM' as unknown,
          audioQuality: 'high' as unknown,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      });

      // Setup audio level monitoring
      this.recording.setOnRecordingStatusUpdate((status) => {
        if (status.metering !== undefined) {
          const level = this.normalizeAudioLevel(status.metering);
          this.emit({
            type: 'audio_level',
            level: { level, timestamp: Date.now() },
          });
        }
      });

      await this.recording.startAsync();
      this.emit({ type: 'recording_start' });
    } catch (error) {
      this.setState('error');
      this.emitError('Failed to start recording', error);
    }
  }

  /**
   * Stop recording and return audio data
   */
  async stopRecording(): Promise<{ uri: string; duration: number } | null> {
    if (!this.recording || this.state !== 'recording') {
      this.log('Not recording', {}, 'warn');
      return null;
    }

    this.log('Stopping recording');

    try {
      const status = await this.recording.getStatusAsync();
      await this.recording.stopAndUnloadAsync();

      const uri = this.recording.getURI();
      const duration = status.durationMillis;

      this.recording = null;
      this.setState('idle');

      this.emit({ type: 'recording_stop', duration });
      this.log('Recording stopped', { uri, duration });

      return uri ? { uri, duration } : null;
    } catch (error) {
      this.setState('error');
      this.emitError('Failed to stop recording', error);
      return null;
    }
  }

  /**
   * Send recorded audio to the agent and get voice response
   */
  async sendVoiceMessage(audioUri: string): Promise<string> {
    this.log('Sending voice message', { uri: audioUri });
    this.setState('processing');

    try {
      // For now, we'll convert audio to base64 and send to backend
      // In production, you might want to use multipart/form-data
      const audioData = await this.readAudioFile(audioUri);

      const response = await this.config.httpClient.post<{
        transcription: string;
        response: string;
        audioUrl?: string;
      }>(API_ENDPOINTS.VOICE_START, {
        assistantId: this.config.assistantId,
        endUserId: this.config.userId,
        audio: audioData,
        voice: this.config.voiceConfig?.voiceId || 'Puck',
      });

      this.emit({ type: 'transcription', text: response.transcription, isFinal: true });

      // Play response audio if available
      if (response.audioUrl) {
        await this.playAudio(response.audioUrl);
      }

      this.setState('idle');
      return response.response;
    } catch (error) {
      this.setState('error');
      this.emitError('Failed to send voice message', error);
      throw error;
    }
  }

  /**
   * Play audio from URL
   */
  async playAudio(uri: string): Promise<void> {
    if (!this.Audio) {
      await this.initialize();
    }

    this.log('Playing audio', { uri });
    this.setState('playing');
    this.emit({ type: 'response_start' });

    try {
      const { Sound } = this.Audio!;
      const { sound } = await Sound.createAsync({ uri });
      this.playback = sound as unknown as AudioSound;

      this.playback.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          this.setState('idle');
          this.emit({ type: 'response_end', text: '' });
        }
      });

      await this.playback.playAsync();
    } catch (error) {
      this.setState('error');
      this.emitError('Failed to play audio', error);
    }
  }

  /**
   * Stop audio playback
   */
  async stopPlayback(): Promise<void> {
    if (this.playback) {
      try {
        await this.playback.stopAsync();
        await this.playback.unloadAsync();
      } catch {
        // Ignore errors during cleanup
      }
      this.playback = null;
    }

    if (this.state === 'playing') {
      this.setState('idle');
    }
  }

  /**
   * Use Expo Speech as TTS fallback
   */
  async speakText(text: string): Promise<void> {
    if (!this.config.voiceConfig?.useExpoSpeechFallback) {
      return;
    }

    try {
      const Speech = await import('expo-speech');

      this.setState('playing');
      this.emit({ type: 'response_start' });

      await new Promise<void>((resolve, reject) => {
        Speech.speak(text, {
          onDone: () => {
            this.setState('idle');
            this.emit({ type: 'response_end', text });
            resolve();
          },
          onError: () => {
            this.setState('error');
            reject(new Error('Speech synthesis failed'));
          },
        });
      });
    } catch (error) {
      this.emitError('Failed to speak text', error);
    }
  }

  /**
   * Get current state
   */
  getState(): VoiceState {
    return this.state;
  }

  /**
   * Get current session
   */
  getSession(): VoiceSession | null {
    return this.currentSession;
  }

  /**
   * Subscribe to voice events
   */
  on<T extends VoiceEvent['type']>(
    type: T,
    handler: (event: Extract<VoiceEvent, { type: T }>) => void
  ): () => void {
    return this.eventEmitter.on(type, handler);
  }

  /**
   * Subscribe to all events
   */
  onAny(handler: (event: VoiceEvent) => void): () => void {
    return this.eventEmitter.onAny(handler);
  }

  /**
   * Cleanup resources
   */
  async destroy(): Promise<void> {
    await this.stopRecording();
    await this.stopPlayback();

    if (this.audioLevelInterval) {
      clearInterval(this.audioLevelInterval);
      this.audioLevelInterval = null;
    }

    this.eventEmitter.removeAllListeners();
    this.setState('idle');
  }

  // --------------------------------------------------------------------------
  // Private Methods
  // --------------------------------------------------------------------------

  /**
   * Set state and emit change event
   */
  private setState(state: VoiceState): void {
    const previousState = this.state;
    if (previousState !== state) {
      this.state = state;
      this.emit({ type: 'state_change', state, previousState });
    }
  }

  /**
   * Emit an event
   */
  private emit(event: VoiceEvent): void {
    this.eventEmitter.emit(event);
  }

  /**
   * Emit an error event
   */
  private emitError(message: string, cause?: unknown): void {
    const error = this.createError('VOICE_ERROR', message);
    if (cause instanceof Error) {
      error.cause = cause;
    }
    this.emit({ type: 'error', error });
  }

  /**
   * Create error object
   */
  private createError(code: AgentError['code'], message: string): AgentError {
    return { code, message };
  }

  /**
   * Normalize audio level from dB to 0-1 range
   */
  private normalizeAudioLevel(dbValue: number): number {
    // Convert from dB (-160 to 0) to 0-1 range
    const minDb = -60;
    const maxDb = 0;
    const normalized = (dbValue - minDb) / (maxDb - minDb);
    return Math.max(0, Math.min(1, normalized));
  }

  /**
   * Read audio file as base64
   */
  private async readAudioFile(uri: string): Promise<string> {
    try {
      const FileSystem = await import('expo-file-system');
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64;
    } catch {
      // Fallback: fetch as blob
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
  }

  /**
   * Debug logging
   */
  private log(
    message: string,
    data?: Record<string, unknown>,
    level: 'log' | 'warn' | 'error' = 'log'
  ): void {
    if (!this.config.debug) return;

    const logMessage = `[VoziaAgent:Voice] ${message}`;
    if (data) {
      console[level](logMessage, data);
    } else {
      console[level](logMessage);
    }
  }
}
