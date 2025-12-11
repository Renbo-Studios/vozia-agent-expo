// ============================================================================
// VOZIA AGENT SDK - useAgent HOOK
// ============================================================================

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useAgentStore } from '../store/agentStore';
import { AgentClient } from '../core/AgentClient';
import type {
  AgentConfig,
  AgentFeatures,
  AgentTheme,
  AgentEvent,
  AgentEventHandler,
  ConnectionStatus,
  AgentError,
} from '../types';

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export interface UseAgentOptions {
  /** Auto-connect on initialization */
  autoConnect?: boolean;
  /** Features to enable/disable */
  features?: Partial<AgentFeatures>;
  /** Theme customization */
  theme?: Partial<AgentTheme>;
  /** Enable dark mode */
  isDark?: boolean;
  /** Enable debug logging */
  debug?: boolean;
}

export interface UseAgentReturn {
  // State
  isInitialized: boolean;
  isConnected: boolean;
  isReady: boolean;
  connectionStatus: ConnectionStatus;
  error: AgentError | null;
  config: AgentConfig | null;
  features: AgentFeatures;
  theme: AgentTheme;

  // Actions
  initialize: (config: AgentConfig, options?: UseAgentOptions) => Promise<void>;
  connect: () => Promise<void>;
  disconnect: () => void;
  reset: () => void;

  // Theme
  updateTheme: (theme: Partial<AgentTheme>) => void;
  toggleDarkMode: () => void;

  // Features
  updateFeatures: (features: Partial<AgentFeatures>) => void;

  // Events
  on: <T extends AgentEvent['type']>(
    type: T,
    handler: AgentEventHandler<T>
  ) => () => void;

  // Client access
  client: AgentClient | null;
}

// ----------------------------------------------------------------------------
// Hook
// ----------------------------------------------------------------------------

/**
 * Main hook for interacting with the Vozia Agent SDK
 */
export function useAgent(
  initialConfig?: AgentConfig,
  options?: UseAgentOptions
): UseAgentReturn {
  const clientRef = useRef<AgentClient | null>(null);

  // Store state
  const isInitialized = useAgentStore((s) => s.isInitialized);
  const connectionStatus = useAgentStore((s) => s.connectionStatus);
  const error = useAgentStore((s) => s.lastError);
  const config = useAgentStore((s) => s.config);
  const features = useAgentStore((s) => s.features);
  const theme = useAgentStore((s) => s.theme);

  // Store actions
  const storeInitialize = useAgentStore((s) => s.initialize);
  const storeReset = useAgentStore((s) => s.reset);
  const setConnectionStatus = useAgentStore((s) => s.setConnectionStatus);
  const setError = useAgentStore((s) => s.setError);
  const storeUpdateTheme = useAgentStore((s) => s.updateTheme);
  const storeToggleDarkMode = useAgentStore((s) => s.toggleDarkMode);
  const storeUpdateFeatures = useAgentStore((s) => s.updateFeatures);

  // Computed state
  const isConnected = connectionStatus === 'connected';
  const isReady = isInitialized && isConnected;

  // Initialize the agent
  const initialize = useCallback(
    async (agentConfig: AgentConfig, initOptions?: UseAgentOptions) => {
      try {
        // Destroy existing client
        if (clientRef.current) {
          clientRef.current.destroy();
        }

        // Merge options
        const mergedOptions = { ...options, ...initOptions };

        // Create new client
        clientRef.current = AgentClient.initialize(agentConfig, mergedOptions);

        // Update store
        storeInitialize(agentConfig, mergedOptions);

        // Setup event listeners to sync with store
        clientRef.current.on('connected', () => {
          setConnectionStatus('connected');
        });

        clientRef.current.on('disconnected', () => {
          setConnectionStatus('disconnected');
        });

        clientRef.current.on('reconnecting', () => {
          setConnectionStatus('reconnecting');
        });

        clientRef.current.on('error', (event) => {
          setError(event.error);
        });

        // Auto-connect if specified
        if (mergedOptions?.autoConnect !== false) {
          await connect();
        }
      } catch (err) {
        const agentError: AgentError = {
          code: 'INITIALIZATION_ERROR',
          message: err instanceof Error ? err.message : 'Failed to initialize agent',
        };
        setError(agentError);
        throw agentError;
      }
    },
    [options, storeInitialize, setConnectionStatus, setError]
  );

  // Connect to agent
  const connect = useCallback(async () => {
    if (!clientRef.current) {
      throw new Error('Agent not initialized. Call initialize() first.');
    }

    setConnectionStatus('connecting');
    try {
      await clientRef.current.connect();
    } catch (err) {
      setConnectionStatus('error');
      throw err;
    }
  }, [setConnectionStatus]);

  // Disconnect from agent
  const disconnect = useCallback(() => {
    clientRef.current?.disconnect();
    setConnectionStatus('disconnected');
  }, [setConnectionStatus]);

  // Reset everything
  const reset = useCallback(() => {
    clientRef.current?.destroy();
    clientRef.current = null;
    storeReset();
  }, [storeReset]);

  // Update theme
  const updateTheme = useCallback(
    (themeUpdate: Partial<AgentTheme>) => {
      clientRef.current?.updateTheme(themeUpdate);
      storeUpdateTheme(themeUpdate);
    },
    [storeUpdateTheme]
  );

  // Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    clientRef.current?.toggleDarkMode();
    storeToggleDarkMode();
  }, [storeToggleDarkMode]);

  // Update features
  const updateFeatures = useCallback(
    (featureUpdate: Partial<AgentFeatures>) => {
      storeUpdateFeatures(featureUpdate);
    },
    [storeUpdateFeatures]
  );

  // Subscribe to events
  const on = useCallback(
    <T extends AgentEvent['type']>(
      type: T,
      handler: AgentEventHandler<T>
    ): (() => void) => {
      if (!clientRef.current) {
        console.warn('[useAgent] Cannot subscribe to events: agent not initialized');
        return () => {};
      }
      return clientRef.current.on(type, handler);
    },
    []
  );

  // Auto-initialize if config provided
  useEffect(() => {
    if (initialConfig && !isInitialized) {
      initialize(initialConfig, options);
    }
  }, [initialConfig, isInitialized, initialize, options]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Don't destroy client on unmount to support multiple hook instances
      // The client persists in the singleton
    };
  }, []);

  return useMemo(
    () => ({
      // State
      isInitialized,
      isConnected,
      isReady,
      connectionStatus,
      error,
      config,
      features,
      theme,

      // Actions
      initialize,
      connect,
      disconnect,
      reset,

      // Theme
      updateTheme,
      toggleDarkMode,

      // Features
      updateFeatures,

      // Events
      on,

      // Client access
      client: clientRef.current,
    }),
    [
      isInitialized,
      isConnected,
      isReady,
      connectionStatus,
      error,
      config,
      features,
      theme,
      initialize,
      connect,
      disconnect,
      reset,
      updateTheme,
      toggleDarkMode,
      updateFeatures,
      on,
    ]
  );
}
