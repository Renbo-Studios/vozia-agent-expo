// ============================================================================
// VOZIA AGENT SDK - WAVEFORM VISUALIZER COMPONENT
// ============================================================================

import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../ThemeProvider';
import type { AgentTheme, AudioLevel } from '../../types';

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export interface WaveformVisualizerProps {
  /** Audio levels to visualize */
  levels: AudioLevel[];
  /** Current audio level (0-1) */
  currentLevel?: number;
  /** Number of bars to display */
  barCount?: number;
  /** Color of the bars */
  color?: string;
  /** Whether the visualizer is active */
  isActive?: boolean;
  /** Height of the visualizer */
  height?: number;
  /** Style of visualization */
  variant?: 'bars' | 'line' | 'circle';
  testID?: string;
}

// ----------------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------------

/**
 * Animated waveform visualizer for audio levels
 */
export function WaveformVisualizer({
  levels,
  currentLevel = 0,
  barCount = 20,
  color,
  isActive = false,
  height = 60,
  variant = 'bars',
  testID,
}: WaveformVisualizerProps) {
  const theme = useTheme();
  const styles = createStyles(theme, height);
  const barColor = color || theme.primaryColor;

  // Get the last N levels for display
  const displayLevels = useMemo(() => {
    const result: number[] = [];
    const startIndex = Math.max(0, levels.length - barCount);

    for (let i = 0; i < barCount; i++) {
      const levelIndex = startIndex + i;
      if (levelIndex < levels.length) {
        result.push(levels[levelIndex].level);
      } else {
        result.push(0);
      }
    }

    return result;
  }, [levels, barCount]);

  if (variant === 'circle') {
    return (
      <CircleVisualizer
        level={currentLevel}
        color={barColor}
        isActive={isActive}
        size={height}
        testID={testID}
      />
    );
  }

  if (variant === 'line') {
    return (
      <LineVisualizer
        levels={displayLevels}
        color={barColor}
        isActive={isActive}
        height={height}
        testID={testID}
      />
    );
  }

  // Default: bars
  return (
    <View style={[styles.container, { height }]} testID={testID}>
      {displayLevels.map((level, index) => {
        const barHeight = Math.max(4, level * height * 0.9);
        const opacity = isActive ? 0.5 + level * 0.5 : 0.3;

        return (
          <View
            key={index}
            style={[
              styles.bar,
              {
                height: barHeight,
                backgroundColor: barColor,
                opacity,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

// ----------------------------------------------------------------------------
// Circle Visualizer
// ----------------------------------------------------------------------------

interface CircleVisualizerProps {
  level: number;
  color: string;
  isActive: boolean;
  size: number;
  testID?: string;
}

function CircleVisualizer({
  level,
  color,
  isActive,
  size,
  testID,
}: CircleVisualizerProps) {
  const baseSize = size * 0.5;
  const maxScale = 1.5;
  const scale = isActive ? 1 + level * (maxScale - 1) : 1;
  const currentSize = baseSize * scale;
  const opacity = isActive ? 0.6 + level * 0.4 : 0.3;

  return (
    <View
      style={{
        width: size,
        height: size,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      testID={testID}
    >
      {/* Outer ring */}
      <View
        style={{
          position: 'absolute',
          width: currentSize * 1.3,
          height: currentSize * 1.3,
          borderRadius: currentSize * 0.65,
          backgroundColor: color,
          opacity: opacity * 0.3,
        }}
      />

      {/* Middle ring */}
      <View
        style={{
          position: 'absolute',
          width: currentSize * 1.15,
          height: currentSize * 1.15,
          borderRadius: currentSize * 0.575,
          backgroundColor: color,
          opacity: opacity * 0.5,
        }}
      />

      {/* Inner circle */}
      <View
        style={{
          width: currentSize,
          height: currentSize,
          borderRadius: currentSize / 2,
          backgroundColor: color,
          opacity,
        }}
      />
    </View>
  );
}

// ----------------------------------------------------------------------------
// Line Visualizer
// ----------------------------------------------------------------------------

interface LineVisualizerProps {
  levels: number[];
  color: string;
  isActive: boolean;
  height: number;
  testID?: string;
}

function LineVisualizer({
  levels,
  color,
  isActive,
  height,
  testID,
}: LineVisualizerProps) {
  const centerY = height / 2;

  return (
    <View
      style={{
        height,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
      }}
      testID={testID}
    >
      {levels.map((level, index) => {
        const amplitude = isActive ? level * (height * 0.4) : 2;
        const opacity = isActive ? 0.5 + level * 0.5 : 0.3;

        return (
          <View
            key={index}
            style={{
              width: 2,
              height: amplitude * 2 + 4,
              backgroundColor: color,
              marginHorizontal: 1,
              borderRadius: 1,
              opacity,
            }}
          />
        );
      })}
    </View>
  );
}

// ----------------------------------------------------------------------------
// Mic Visualizer (Simplified)
// ----------------------------------------------------------------------------

export interface MicVisualizerProps {
  level: number;
  isRecording: boolean;
  color?: string;
  size?: number;
  testID?: string;
}

/**
 * Simple microphone visualizer with pulsing effect
 */
export function MicVisualizer({
  level,
  isRecording,
  color,
  size = 80,
  testID,
}: MicVisualizerProps) {
  const theme = useTheme();
  const micColor = color || theme.primaryColor;

  return (
    <View
      style={{
        width: size,
        height: size,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      testID={testID}
    >
      {/* Pulse rings */}
      {isRecording && (
        <>
          <View
            style={{
              position: 'absolute',
              width: size * (1 + level * 0.3),
              height: size * (1 + level * 0.3),
              borderRadius: size * 0.5 * (1 + level * 0.3),
              backgroundColor: micColor,
              opacity: 0.1,
            }}
          />
          <View
            style={{
              position: 'absolute',
              width: size * (0.85 + level * 0.2),
              height: size * (0.85 + level * 0.2),
              borderRadius: size * 0.425 * (1 + level * 0.2),
              backgroundColor: micColor,
              opacity: 0.2,
            }}
          />
        </>
      )}

      {/* Mic icon container */}
      <View
        style={{
          width: size * 0.7,
          height: size * 0.7,
          borderRadius: size * 0.35,
          backgroundColor: isRecording ? micColor : theme.surfaceColor,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: isRecording ? 0 : 2,
          borderColor: theme.borderColor,
        }}
      >
        {/* Mic icon */}
        <View
          style={{
            width: size * 0.18,
            height: size * 0.28,
            backgroundColor: isRecording ? '#FFFFFF' : theme.textSecondaryColor,
            borderRadius: size * 0.09,
          }}
        />
        <View
          style={{
            width: size * 0.28,
            height: size * 0.04,
            backgroundColor: isRecording ? '#FFFFFF' : theme.textSecondaryColor,
            marginTop: 2,
            borderRadius: size * 0.02,
          }}
        />
      </View>
    </View>
  );
}

// ----------------------------------------------------------------------------
// Styles
// ----------------------------------------------------------------------------

function createStyles(theme: AgentTheme, height: number) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 8,
    } as ViewStyle,

    bar: {
      width: 3,
      marginHorizontal: 1,
      borderRadius: 1.5,
      minHeight: 4,
    } as ViewStyle,
  });
}
