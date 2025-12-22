// ============================================================================
// VOZIA AGENT SDK - CUSTOMER SERVICE CONTEXT
// ============================================================================

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type {
  CustomerServiceConfig,
  CustomerServiceScreen,
  UseCustomerServiceReturn,
} from './types';
import { DEFAULT_CONFIG, DEFAULT_LABELS } from './constants';

// ----------------------------------------------------------------------------
// Context
// ----------------------------------------------------------------------------

interface CustomerServiceContextValue extends UseCustomerServiceReturn {}

const CustomerServiceContext = createContext<CustomerServiceContextValue | null>(null);

// ----------------------------------------------------------------------------
// Provider
// ----------------------------------------------------------------------------

export interface CustomerServiceContextProviderProps {
  config?: CustomerServiceConfig;
  children: React.ReactNode;
}

/**
 * Internal context provider for CustomerService state management
 */
export function CustomerServiceContextProvider({
  config: userConfig,
  children,
}: CustomerServiceContextProviderProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<CustomerServiceScreen>('home');
  const [config, setConfig] = useState<CustomerServiceConfig>(() =>
    mergeConfig(userConfig)
  );

  // Update config when props change
  React.useEffect(() => {
    setConfig(mergeConfig(userConfig));
  }, [userConfig]);

  const open = useCallback((screen: CustomerServiceScreen = 'home') => {
    setCurrentScreen(screen);
    setIsVisible(true);
  }, []);

  const close = useCallback(() => {
    setIsVisible(false);
  }, []);

  const toggle = useCallback(() => {
    setIsVisible((prev) => !prev);
  }, []);

  const navigateTo = useCallback((screen: CustomerServiceScreen) => {
    setCurrentScreen(screen);
    if (!isVisible) {
      setIsVisible(true);
    }
  }, [isVisible]);

  const updateConfig = useCallback((newConfig: Partial<CustomerServiceConfig>) => {
    setConfig((prev) => ({
      ...prev,
      ...newConfig,
      theme: {
        ...prev.theme,
        ...newConfig.theme,
      },
      labels: {
        ...prev.labels,
        ...newConfig.labels,
      },
    }));
  }, []);

  const value = useMemo(
    () => ({
      isVisible,
      open,
      close,
      toggle,
      navigateTo,
      currentScreen,
      config,
      updateConfig,
    }),
    [isVisible, open, close, toggle, navigateTo, currentScreen, config, updateConfig]
  );

  return (
    <CustomerServiceContext.Provider value={value}>
      {children}
    </CustomerServiceContext.Provider>
  );
}

// ----------------------------------------------------------------------------
// Hook
// ----------------------------------------------------------------------------

/**
 * Hook to access CustomerService context
 * Must be used within CustomerServiceContextProvider
 */
export function useCustomerServiceContext(): UseCustomerServiceReturn {
  const context = useContext(CustomerServiceContext);

  if (!context) {
    // Return a no-op implementation when used outside provider
    // This allows the hook to be used anywhere without crashing
    return {
      isVisible: false,
      open: (_screen?: CustomerServiceScreen) => {
        console.warn(
          '[useCustomerService] No CustomerServiceProvider found. ' +
          'Wrap your app with CustomerServiceProvider or use CustomerServiceButton which includes its own provider.'
        );
      },
      close: () => {},
      toggle: () => {},
      navigateTo: () => {},
      currentScreen: 'home',
      config: mergeConfig(undefined),
      updateConfig: () => {},
    };
  }

  return context;
}

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

function mergeConfig(userConfig?: CustomerServiceConfig): CustomerServiceConfig {
  return {
    ...DEFAULT_CONFIG,
    ...userConfig,
    theme: {
      ...DEFAULT_CONFIG.theme,
      ...userConfig?.theme,
    },
    labels: {
      ...DEFAULT_LABELS,
      ...userConfig?.labels,
    },
  };
}
