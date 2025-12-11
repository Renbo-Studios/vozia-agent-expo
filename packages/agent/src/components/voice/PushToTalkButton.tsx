// ============================================================================
// VOZIA AGENT SDK - PUSH TO TALK BUTTON COMPONENT
// ============================================================================

import React, { useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../ThemeProvider';
import { MicVisualizer } from './WaveformVisualizer';
import type { AgentTheme } from '../../types';

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export interface PushToTalkButtonProps {
  /** Whether currently recording */
  isRecording: boolean;
  /** Whether processing/sending */
  isProcessing?: boolean;
  /** Current audio level (0-1) */
  audioLevel?: number;
  /** Push-to-talk mode (hold to record) vs tap-to-toggle */
  pushToTalk?: boolean;
  /** Button size */
  size?: 'small' | 'medium' | 'large';
  /** Called when recording should start */
  onRecordStart?: () => void;
  /** Called when recording should stop */
  onRecordStop?: () => void;
  /** Called when button is pressed (tap mode) */
  onPress?: () => void;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Custom label */
  label?: string;
  testID?: string;
}

// ----------------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------------

/**
 * Push-to-talk or tap-to-toggle voice recording button
 */
export function PushToTalkButton({
  isRecording,
  isProcessing = false,
  audioLevel = 0,
  pushToTalk = true,
  size = 'large',
  onRecordStart,
  onRecordStop,
  onPress,
  disabled = false,
  label,
  testID,
}: PushToTalkButtonProps) {
  const theme = useTheme();
  const styles = createStyles(theme, size);
  const isHoldingRef = useRef(false);

  // Get button dimensions based on size
  const buttonSize = size === 'small' ? 60 : size === 'medium' ? 80 : 100;

  // Handle press in (for push-to-talk)
  const handlePressIn = useCallback(() => {
    if (disabled || isProcessing) return;

    if (pushToTalk) {
      isHoldingRef.current = true;
      onRecordStart?.();

      // Trigger haptic feedback
      triggerHaptic();
    }
  }, [disabled, isProcessing, pushToTalk, onRecordStart]);

  // Handle press out (for push-to-talk)
  const handlePressOut = useCallback(() => {
    if (pushToTalk && isHoldingRef.current) {
      isHoldingRef.current = false;
      onRecordStop?.();

      // Trigger haptic feedback
      triggerHaptic();
    }
  }, [pushToTalk, onRecordStop]);

  // Handle press (for tap-to-toggle)
  const handlePress = useCallback(() => {
    if (disabled || isProcessing) return;

    if (!pushToTalk) {
      onPress?.();

      // Trigger haptic feedback
      triggerHaptic();
    }
  }, [disabled, isProcessing, pushToTalk, onPress]);

  // Get status text
  const statusText = isProcessing
    ? 'Processing...'
    : isRecording
    ? pushToTalk
      ? 'Release to send'
      : 'Tap to stop'
    : pushToTalk
    ? 'Hold to talk'
    : label || 'Tap to speak';

  return (
    <View style={styles.container} testID={testID}>
      {/* Button */}
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled || isProcessing}
        style={({ pressed }) => [
          styles.button,
          {
            width: buttonSize,
            height: buttonSize,
            borderRadius: buttonSize / 2,
          },
          isRecording && styles.buttonRecording,
          isProcessing && styles.buttonProcessing,
          disabled && styles.buttonDisabled,
          pressed && !isRecording && styles.buttonPressed,
        ]}
        testID={`${testID}-button`}
      >
        <MicVisualizer
          level={audioLevel}
          isRecording={isRecording}
          color={isRecording ? '#FFFFFF' : undefined}
          size={buttonSize * 0.7}
        />
      </Pressable>

      {/* Status text */}
      <Text style={styles.statusText}>{statusText}</Text>
    </View>
  );
}

// ----------------------------------------------------------------------------
// Voice Recording Button (Simplified variant)
// ----------------------------------------------------------------------------

export interface VoiceRecordButtonProps {
  isRecording: boolean;
  onToggle: () => void;
  disabled?: boolean;
  size?: number;
  testID?: string;
}

/**
 * Simple circular voice recording button
 */
export function VoiceRecordButton({
  isRecording,
  onToggle,
  disabled = false,
  size = 56,
  testID,
}: VoiceRecordButtonProps) {
  const theme = useTheme();

  return (
    <TouchableOpacity
      onPress={onToggle}
      disabled={disabled}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: isRecording ? theme.errorColor : theme.primaryColor,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: disabled ? 0.5 : 1,
      }}
      testID={testID}
    >
      {isRecording ? (
        // Stop icon
        <View
          style={{
            width: size * 0.3,
            height: size * 0.3,
            backgroundColor: '#FFFFFF',
            borderRadius: 2,
          }}
        />
      ) : (
        // Mic icon
        <View>
          <View
            style={{
              width: size * 0.2,
              height: size * 0.32,
              backgroundColor: '#FFFFFF',
              borderRadius: size * 0.1,
            }}
          />
          <View
            style={{
              width: size * 0.32,
              height: size * 0.05,
              backgroundColor: '#FFFFFF',
              marginTop: 2,
              borderRadius: size * 0.025,
            }}
          />
        </View>
      )}
    </TouchableOpacity>
  );
}

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

async function triggerHaptic() {
  try {
    const Haptics = await import('expo-haptics');
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch {
    // Haptics not available
  }
}

// ----------------------------------------------------------------------------
// Styles
// ----------------------------------------------------------------------------

function createStyles(theme: AgentTheme, size: 'small' | 'medium' | 'large') {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
    } as ViewStyle,

    button: {
      backgroundColor: theme.surfaceColor,
      borderWidth: 3,
      borderColor: theme.borderColor,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    } as ViewStyle,

    buttonRecording: {
      backgroundColor: theme.primaryColor,
      borderColor: theme.primaryColor,
    } as ViewStyle,

    buttonProcessing: {
      backgroundColor: theme.secondaryColor,
      borderColor: theme.secondaryColor,
      opacity: 0.8,
    } as ViewStyle,

    buttonDisabled: {
      opacity: 0.5,
    } as ViewStyle,

    buttonPressed: {
      transform: [{ scale: 0.95 }],
      opacity: 0.9,
    } as ViewStyle,

    statusText: {
      marginTop: theme.spacingMd,
      fontSize: theme.fontSizeMedium,
      color: theme.textSecondaryColor,
      textAlign: 'center',
    } as TextStyle,
  });
}
