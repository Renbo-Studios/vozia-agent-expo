// ============================================================================
// VOZIA AGENT SDK - AGENT PROVIDER
// ============================================================================

import React, { useEffect, useRef } from 'react';
import { ThemeProvider } from './ThemeProvider';
import { AgentClient } from '../core/AgentClient';
import { useAgentStore } from '../store/agentStore';
import type { AgentConfig, AgentFeatures, AgentTheme } from '../types';

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export interface AgentProviderProps {
  children: React.ReactNode;
  /** Core agent configuration */
  config: AgentConfig;
  /** Feature flags */
  features?: Partial<AgentFeatures>;
  /** Theme customization */
  theme?: Partial<AgentTheme>;
  /** Enable dark mode */
  isDark?: boolean;
  /** Enable debug logging */
  debug?: boolean;
  /** Auto-connect on mount */
  autoConnect?: boolean;
  /** Called when agent is ready */
  onReady?: () => void;
  /** Called on initialization error */
  onError?: (error: Error) => void;
}

// ----------------------------------------------------------------------------
// Provider
// ----------------------------------------------------------------------------

/**
 * Main provider component that initializes the Vozia Agent SDK
 * Wrap your app with this provider to enable agent functionality
 *
 * @example
 * ```tsx
 * <AgentProvider
 *   config={{
 *     orgId: 'your-org-id',
 *     assistantId: 'your-assistant-id',
 *     apiKey: 'your-api-key',
 *   }}
 *   theme={{
 *     primaryColor: '#6366F1',
 *   }}
 *   features={{
 *     voice: true,
 *     tools: true,
 *   }}
 * >
 *   <App />
 * </AgentProvider>
 * ```
 */
export function AgentProvider({
  children,
  config,
  features,
  theme,
  isDark,
  debug = false,
  autoConnect = true,
  onReady,
  onError,
}: AgentProviderProps) {
  const initializedRef = useRef(false);
  const storeInitialize = useAgentStore((s) => s.initialize);
  const setConnectionStatus = useAgentStore((s) => s.setConnectionStatus);
  const setError = useAgentStore((s) => s.setError);

  useEffect(() => {
    // Prevent double initialization in strict mode
    if (initializedRef.current) return;
    initializedRef.current = true;

    const initializeAgent = async () => {
      try {
        // Initialize the agent client (singleton)
        AgentClient.initialize(config, {
          features,
          theme,
          isDark,
          debug,
        });

        // Update store
        storeInitialize(config, { features, theme, isDark, debug });

        // Auto-connect if enabled
        if (autoConnect) {
          setConnectionStatus('connecting');
          try {
            await AgentClient.getInstance().connect();
            onReady?.();
          } catch (connectError) {
            if (debug) {
              console.warn('[AgentProvider] Auto-connect failed:', connectError);
            }
            // Don't throw - allow offline usage
          }
        } else {
          onReady?.();
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Initialization failed');
        setError({ code: 'INITIALIZATION_ERROR', message: err.message });
        onError?.(err);

        if (debug) {
          console.error('[AgentProvider] Initialization error:', error);
        }
      }
    };

    initializeAgent();

    // Cleanup on unmount
    return () => {
      // We don't destroy the client on unmount to support HMR and navigation
      // The client is a singleton and should persist
    };
  }, []); // Empty deps - only run once

  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
}

// ----------------------------------------------------------------------------
// HOC for wrapping components with provider
// ----------------------------------------------------------------------------

export interface WithAgentOptions {
  config: AgentConfig;
  features?: Partial<AgentFeatures>;
  theme?: Partial<AgentTheme>;
  isDark?: boolean;
  debug?: boolean;
}

/**
 * Higher-order component to wrap a component with AgentProvider
 */
export function withAgent<P extends object>(
  Component: React.ComponentType<P>,
  options: WithAgentOptions
) {
  return function WrappedWithAgent(props: P) {
    return (
      <AgentProvider {...options}>
        <Component {...props} />
      </AgentProvider>
    );
  };
}
