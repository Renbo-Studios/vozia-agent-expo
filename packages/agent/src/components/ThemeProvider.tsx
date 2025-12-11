// ============================================================================
// VOZIA AGENT SDK - THEME PROVIDER
// ============================================================================

import React, { createContext, useContext, useMemo } from 'react';
import { useAgentStore } from '../store/agentStore';
import type { AgentTheme } from '../types';
import { DEFAULT_LIGHT_THEME } from '../core/config';

// ----------------------------------------------------------------------------
// Context
// ----------------------------------------------------------------------------

const ThemeContext = createContext<AgentTheme>(DEFAULT_LIGHT_THEME);

// ----------------------------------------------------------------------------
// Provider
// ----------------------------------------------------------------------------

export interface ThemeProviderProps {
  children: React.ReactNode;
  theme?: Partial<AgentTheme>;
}

/**
 * Theme provider that gives access to the current theme
 */
export function ThemeProvider({ children, theme: customTheme }: ThemeProviderProps) {
  const storeTheme = useAgentStore((s) => s.theme);

  const mergedTheme = useMemo(() => {
    return { ...storeTheme, ...customTheme };
  }, [storeTheme, customTheme]);

  return (
    <ThemeContext.Provider value={mergedTheme}>
      {children}
    </ThemeContext.Provider>
  );
}

// ----------------------------------------------------------------------------
// Hook
// ----------------------------------------------------------------------------

/**
 * Hook to access the current theme
 */
export function useTheme(): AgentTheme {
  return useContext(ThemeContext);
}

// ----------------------------------------------------------------------------
// Styled Component Helper
// ----------------------------------------------------------------------------

export type ThemedStyles<T extends Record<string, unknown>> = (theme: AgentTheme) => T;

/**
 * Helper to create themed styles
 */
export function createThemedStyles<T extends Record<string, unknown>>(
  stylesFn: ThemedStyles<T>
): ThemedStyles<T> {
  return stylesFn;
}

// ----------------------------------------------------------------------------
// Theme Utilities
// ----------------------------------------------------------------------------

/**
 * Get contrasting text color for a background
 */
export function getContrastColor(hexColor: string): string {
  // Remove # if present
  const hex = hexColor.replace('#', '');

  // Parse RGB values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

/**
 * Adjust color brightness
 */
export function adjustBrightness(hexColor: string, percent: number): string {
  const hex = hexColor.replace('#', '');

  const r = Math.max(0, Math.min(255, parseInt(hex.substring(0, 2), 16) + percent));
  const g = Math.max(0, Math.min(255, parseInt(hex.substring(2, 4), 16) + percent));
  const b = Math.max(0, Math.min(255, parseInt(hex.substring(4, 6), 16) + percent));

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Add transparency to color
 */
export function withOpacity(hexColor: string, opacity: number): string {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
