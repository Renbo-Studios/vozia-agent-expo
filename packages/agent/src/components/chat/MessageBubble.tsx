// ============================================================================
// VOZIA AGENT SDK - MESSAGE BUBBLE COMPONENT
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../ThemeProvider';
import type { Message, AgentTheme } from '../../types';

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export interface MessageBubbleProps {
  message: Message;
  showAvatar?: boolean;
  avatarUrl?: string;
  testID?: string;
}

// ----------------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------------

/**
 * A single message bubble (user or assistant)
 */
export function MessageBubble({
  message,
  showAvatar = true,
  avatarUrl,
  testID,
}: MessageBubbleProps) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const isUser = message.role === 'user';

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.assistantContainer,
      ]}
      testID={testID}
    >
      {showAvatar && !isUser && (
        <View style={styles.avatarContainer}>
          {avatarUrl ? (
            <View style={styles.avatar}>
              {/* Avatar image would go here */}
              <Text style={styles.avatarText}>A</Text>
            </View>
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>A</Text>
            </View>
          )}
        </View>
      )}

      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isUser ? styles.userText : styles.assistantText,
          ]}
        >
          {message.content}
        </Text>

        {/* Timestamp */}
        <Text
          style={[
            styles.timestamp,
            isUser ? styles.userTimestamp : styles.assistantTimestamp,
          ]}
        >
          {formatTime(message.timestamp)}
        </Text>

        {/* Status indicator for user messages */}
        {isUser && message.status === 'sending' && (
          <Text style={styles.status}>Sending...</Text>
        )}
        {isUser && message.status === 'error' && (
          <Text style={styles.statusError}>Failed to send</Text>
        )}
      </View>

      {showAvatar && isUser && <View style={styles.avatarSpacer} />}
    </View>
  );
}

// ----------------------------------------------------------------------------
// User Message
// ----------------------------------------------------------------------------

export interface UserMessageProps {
  content: string;
  timestamp?: Date;
  status?: Message['status'];
  testID?: string;
}

/**
 * User message bubble
 */
export function UserMessage({
  content,
  timestamp = new Date(),
  status = 'sent',
  testID,
}: UserMessageProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={[styles.container, styles.userContainer]} testID={testID}>
      <View style={[styles.bubble, styles.userBubble]}>
        <Text style={[styles.messageText, styles.userText]}>{content}</Text>
        <Text style={[styles.timestamp, styles.userTimestamp]}>
          {formatTime(timestamp)}
        </Text>
        {status === 'sending' && <Text style={styles.status}>Sending...</Text>}
        {status === 'error' && (
          <Text style={styles.statusError}>Failed to send</Text>
        )}
      </View>
    </View>
  );
}

// ----------------------------------------------------------------------------
// Agent Message
// ----------------------------------------------------------------------------

export interface AgentMessageProps {
  content: string;
  timestamp?: Date;
  showAvatar?: boolean;
  avatarUrl?: string;
  isStreaming?: boolean;
  testID?: string;
}

/**
 * Agent/Assistant message bubble
 */
export function AgentMessage({
  content,
  timestamp = new Date(),
  showAvatar = true,
  avatarUrl,
  isStreaming = false,
  testID,
}: AgentMessageProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={[styles.container, styles.assistantContainer]} testID={testID}>
      {showAvatar && (
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>A</Text>
          </View>
        </View>
      )}

      <View style={[styles.bubble, styles.assistantBubble]}>
        <Text style={[styles.messageText, styles.assistantText]}>
          {content}
          {isStreaming && <Text style={styles.cursor}>|</Text>}
        </Text>
        {!isStreaming && (
          <Text style={[styles.timestamp, styles.assistantTimestamp]}>
            {formatTime(timestamp)}
          </Text>
        )}
      </View>
    </View>
  );
}

// ----------------------------------------------------------------------------
// Typing Indicator
// ----------------------------------------------------------------------------

export interface TypingIndicatorProps {
  testID?: string;
}

/**
 * Typing indicator shown when assistant is composing
 */
export function TypingIndicator({ testID }: TypingIndicatorProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={[styles.container, styles.assistantContainer]} testID={testID}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>A</Text>
        </View>
      </View>

      <View style={[styles.bubble, styles.assistantBubble, styles.typingBubble]}>
        <View style={styles.typingDots}>
          <View style={[styles.dot, styles.dot1]} />
          <View style={[styles.dot, styles.dot2]} />
          <View style={[styles.dot, styles.dot3]} />
        </View>
      </View>
    </View>
  );
}

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ----------------------------------------------------------------------------
// Styles
// ----------------------------------------------------------------------------

function createStyles(theme: AgentTheme) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacingMd,
      paddingVertical: theme.spacingXs,
      alignItems: 'flex-end',
    } as ViewStyle,

    userContainer: {
      justifyContent: 'flex-end',
    } as ViewStyle,

    assistantContainer: {
      justifyContent: 'flex-start',
    } as ViewStyle,

    avatarContainer: {
      marginRight: theme.spacingSm,
    } as ViewStyle,

    avatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.primaryColor,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    avatarText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    } as TextStyle,

    avatarSpacer: {
      width: 32 + theme.spacingSm,
    } as ViewStyle,

    bubble: {
      maxWidth: '75%',
      paddingHorizontal: theme.spacingMd,
      paddingVertical: theme.spacingSm,
      borderRadius: theme.bubbleRadius,
    } as ViewStyle,

    userBubble: {
      backgroundColor: theme.userBubbleColor,
      borderBottomRightRadius: 4,
    } as ViewStyle,

    assistantBubble: {
      backgroundColor: theme.agentBubbleColor,
      borderBottomLeftRadius: 4,
    } as ViewStyle,

    messageText: {
      fontSize: theme.fontSizeMedium,
      lineHeight: theme.fontSizeMedium * 1.5,
    } as TextStyle,

    userText: {
      color: theme.userBubbleTextColor,
    } as TextStyle,

    assistantText: {
      color: theme.agentBubbleTextColor,
    } as TextStyle,

    timestamp: {
      fontSize: theme.fontSizeSmall,
      marginTop: theme.spacingXs,
    } as TextStyle,

    userTimestamp: {
      color: theme.userBubbleTextColor,
      opacity: 0.7,
      textAlign: 'right',
    } as TextStyle,

    assistantTimestamp: {
      color: theme.textSecondaryColor,
    } as TextStyle,

    status: {
      fontSize: theme.fontSizeSmall,
      color: theme.userBubbleTextColor,
      opacity: 0.7,
      marginTop: 2,
    } as TextStyle,

    statusError: {
      fontSize: theme.fontSizeSmall,
      color: theme.errorColor,
      marginTop: 2,
    } as TextStyle,

    cursor: {
      color: theme.primaryColor,
    } as TextStyle,

    typingBubble: {
      paddingVertical: theme.spacingMd,
    } as ViewStyle,

    typingDots: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    } as ViewStyle,

    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.textSecondaryColor,
      opacity: 0.4,
    } as ViewStyle,

    dot1: {
      // Animation would be applied here
    } as ViewStyle,

    dot2: {
      // Animation would be applied here
    } as ViewStyle,

    dot3: {
      // Animation would be applied here
    } as ViewStyle,
  });
}
