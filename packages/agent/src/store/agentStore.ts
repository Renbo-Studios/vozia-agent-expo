// ============================================================================
// VOZIA AGENT SDK - AGENT STORE (ZUSTAND)
// ============================================================================

import { create } from 'zustand';
import type {
  AgentConfig,
  AgentFeatures,
  AgentTheme,
  ConnectionStatus,
  AgentError,
} from '../types';
import {
  DEFAULT_FEATURES,
  DEFAULT_LIGHT_THEME,
  mergeFeatures,
  mergeTheme,
} from '../core/config';

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export interface AgentState {
  // Configuration
  config: AgentConfig | null;
  features: AgentFeatures;
  theme: AgentTheme;
  isInitialized: boolean;

  // Connection
  connectionStatus: ConnectionStatus;
  lastError: AgentError | null;

  // Session
  currentSessionId: string | null;

  // Debug
  debug: boolean;
}

export interface AgentActions {
  // Initialization
  initialize: (
    config: AgentConfig,
    options?: {
      features?: Partial<AgentFeatures>;
      theme?: Partial<AgentTheme>;
      isDark?: boolean;
      debug?: boolean;
    }
  ) => void;
  reset: () => void;

  // Connection
  setConnectionStatus: (status: ConnectionStatus) => void;
  setError: (error: AgentError | null) => void;

  // Session
  setSessionId: (sessionId: string | null) => void;

  // Theme
  updateTheme: (theme: Partial<AgentTheme>) => void;
  toggleDarkMode: () => void;

  // Features
  updateFeatures: (features: Partial<AgentFeatures>) => void;
}

export type AgentStore = AgentState & AgentActions;

// ----------------------------------------------------------------------------
// Initial State
// ----------------------------------------------------------------------------

const initialState: AgentState = {
  config: null,
  features: DEFAULT_FEATURES,
  theme: DEFAULT_LIGHT_THEME,
  isInitialized: false,
  connectionStatus: 'disconnected',
  lastError: null,
  currentSessionId: null,
  debug: false,
};

// ----------------------------------------------------------------------------
// Store
// ----------------------------------------------------------------------------

export const useAgentStore = create<AgentStore>((set, get) => ({
  ...initialState,

  // Initialization
  initialize: (config, options) => {
    set({
      config,
      features: mergeFeatures(options?.features),
      theme: mergeTheme(options?.theme, options?.isDark),
      isInitialized: true,
      debug: options?.debug ?? false,
      connectionStatus: 'disconnected',
      lastError: null,
    });
  },

  reset: () => {
    set(initialState);
  },

  // Connection
  setConnectionStatus: (status) => {
    set({ connectionStatus: status });
  },

  setError: (error) => {
    set({ lastError: error });
  },

  // Session
  setSessionId: (sessionId) => {
    set({ currentSessionId: sessionId });
  },

  // Theme
  updateTheme: (theme) => {
    const currentTheme = get().theme;
    set({ theme: { ...currentTheme, ...theme } });
  },

  toggleDarkMode: () => {
    const currentTheme = get().theme;
    const newTheme = mergeTheme(currentTheme, !currentTheme.isDark);
    set({ theme: newTheme });
  },

  // Features
  updateFeatures: (features) => {
    const currentFeatures = get().features;
    set({ features: { ...currentFeatures, ...features } });
  },
}));

// ----------------------------------------------------------------------------
// Selectors
// ----------------------------------------------------------------------------

export const selectConfig = (state: AgentStore) => state.config;
export const selectFeatures = (state: AgentStore) => state.features;
export const selectTheme = (state: AgentStore) => state.theme;
export const selectIsInitialized = (state: AgentStore) => state.isInitialized;
export const selectConnectionStatus = (state: AgentStore) => state.connectionStatus;
export const selectLastError = (state: AgentStore) => state.lastError;
export const selectCurrentSessionId = (state: AgentStore) => state.currentSessionId;
export const selectDebug = (state: AgentStore) => state.debug;

// Compound selectors
export const selectIsConnected = (state: AgentStore) =>
  state.connectionStatus === 'connected';
export const selectIsReady = (state: AgentStore) =>
  state.isInitialized && state.connectionStatus === 'connected';
