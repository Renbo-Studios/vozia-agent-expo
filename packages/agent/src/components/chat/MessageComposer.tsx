// ============================================================================
// VOZIA AGENT SDK - MESSAGE COMPOSER COMPONENT
// ============================================================================

import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../ThemeProvider';
import type { AgentTheme } from '../../types';

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export interface MessageComposerProps {
  value?: string;
  onChangeText?: (text: string) => void;
  onSend?: (message: string) => void;
  onVoicePress?: () => void;
  onAttachmentPress?: () => void;
  placeholder?: string;
  disabled?: boolean;
  enableVoice?: boolean;
  enableAttachments?: boolean;
  maxLength?: number;
  testID?: string;
}

// ----------------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------------

/**
 * Message input composer with send button
 */
export function MessageComposer({
  value: controlledValue,
  onChangeText,
  onSend,
  onVoicePress,
  onAttachmentPress,
  placeholder = 'Type a message...',
  disabled = false,
  enableVoice = false,
  enableAttachments = false,
  maxLength = 10000,
  testID,
}: MessageComposerProps) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [internalValue, setInternalValue] = useState('');

  // Use controlled or uncontrolled value
  const value = controlledValue ?? internalValue;
  const setValue = onChangeText ?? setInternalValue;

  const canSend = value.trim().length > 0 && !disabled;

  // Handle text change
  const handleChangeText = useCallback(
    (text: string) => {
      setValue(text);
    },
    [setValue]
  );

  // Handle send
  const handleSend = useCallback(() => {
    if (!canSend) return;

    const message = value.trim();
    onSend?.(message);

    // Clear input after sending
    if (!onChangeText) {
      setInternalValue('');
    }
  }, [canSend, value, onSend, onChangeText]);

  // Handle submit editing (enter key on keyboard)
  const handleSubmitEditing = useCallback(() => {
    if (canSend) {
      handleSend();
    }
  }, [canSend, handleSend]);

  return (
    <View style={styles.container} testID={testID}>
      {/* Attachment button */}
      {enableAttachments && (
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onAttachmentPress}
          disabled={disabled}
          testID={`${testID}-attachment`}
        >
          <AttachmentIcon color={theme.textSecondaryColor} />
        </TouchableOpacity>
      )}

      {/* Text input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={handleChangeText}
          onSubmitEditing={handleSubmitEditing}
          placeholder={placeholder}
          placeholderTextColor={theme.textSecondaryColor}
          editable={!disabled}
          maxLength={maxLength}
          multiline
          numberOfLines={4}
          textAlignVertical="center"
          returnKeyType="send"
          blurOnSubmit={false}
          testID={`${testID}-input`}
        />
      </View>

      {/* Voice button (when no text) */}
      {enableVoice && value.length === 0 && (
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onVoicePress}
          disabled={disabled}
          testID={`${testID}-voice`}
        >
          <MicIcon color={theme.textSecondaryColor} />
        </TouchableOpacity>
      )}

      {/* Send button (when has text) */}
      {value.length > 0 && (
        <TouchableOpacity
          style={[
            styles.sendButton,
            canSend ? styles.sendButtonActive : styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!canSend}
          testID={`${testID}-send`}
        >
          <SendIcon color={canSend ? '#FFFFFF' : theme.textSecondaryColor} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ----------------------------------------------------------------------------
// Icons (Simple SVG-like components)
// ----------------------------------------------------------------------------

interface IconProps {
  color: string;
  size?: number;
}

function SendIcon({ color, size = 20 }: IconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      {/* Simple arrow representation */}
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: size / 2,
          borderRightWidth: size / 2,
          borderBottomWidth: size,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: color,
          transform: [{ rotate: '90deg' }],
        }}
      />
    </View>
  );
}

function MicIcon({ color, size = 20 }: IconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: size * 0.4,
          height: size * 0.6,
          backgroundColor: color,
          borderRadius: size * 0.2,
        }}
      />
      <View
        style={{
          width: size * 0.6,
          height: size * 0.1,
          backgroundColor: color,
          marginTop: 2,
          borderRadius: size * 0.05,
        }}
      />
    </View>
  );
}

function AttachmentIcon({ color, size = 20 }: IconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: size * 0.5,
          height: size * 0.7,
          borderWidth: 2,
          borderColor: color,
          borderRadius: 4,
        }}
      />
    </View>
  );
}

// ----------------------------------------------------------------------------
// Styles
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
// Styles
// ----------------------------------------------------------------------------

function createStyles(theme: AgentTheme) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.backgroundColor,
      // Removed borderTop
    } as ViewStyle,

    inputContainer: {
      flex: 1,
      backgroundColor: theme.surfaceColor,
      borderRadius: 20,
      marginHorizontal: 8,
      minHeight: 40,
      maxHeight: 120,
      justifyContent: 'center',
      // No border
    } as ViewStyle,

    input: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      fontSize: 16,
      color: theme.textColor,
      maxHeight: 100,
    } as TextStyle,

    iconButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    sendButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    sendButtonActive: {
      backgroundColor: theme.primaryColor,
    } as ViewStyle,

    sendButtonDisabled: {
      backgroundColor: theme.borderColor,
      opacity: 0.5,
    } as ViewStyle,
  });
}
