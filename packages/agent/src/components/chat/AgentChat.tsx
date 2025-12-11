// ============================================================================
// VOZIA AGENT SDK - AGENT CHAT COMPONENT
// ============================================================================

import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../ThemeProvider';
import { MessageList } from './MessageList';
import { MessageComposer } from './MessageComposer';
import { useChat } from '../../hooks/useChat';
import type { AgentTheme, AgentChatProps } from '../../types';

// ----------------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------------

/**
 * Full-screen chat interface component
 *
 * @example
 * ```tsx
 * <AgentChat
 *   initialMessage="Hello! How can I help you today?"
 *   placeholder="Ask me anything..."
 *   showHeader={true}
 *   headerTitle="Support"
 *   enableVoice={true}
 * />
 * ```
 */
export function AgentChat({
  initialMessage,
  placeholder = 'Type a message...',
  showHeader = true,
  headerTitle = 'Assistant',
  showAvatar = true,
  avatarUrl,
  enableVoice = false,
  enableAttachments = false,
  onSendMessage,
  onClose,
  style,
  testID,
}: AgentChatProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  const {
    messages,
    isTyping,
    isSending,
    isStreaming,
    streamingContent,
    inputText,
    setInputText,
    sendMessage,
  } = useChat({
    greeting: initialMessage,
  });

  // Handle send
  const handleSend = useCallback(
    async (message: string) => {
      onSendMessage?.(message);
      await sendMessage(message);
      setInputText('');
    },
    [sendMessage, setInputText, onSendMessage]
  );

  // Handle voice press
  const handleVoicePress = useCallback(() => {
    // This would open voice input
    // Implemented in voice components
  }, []);

  return (
    <SafeAreaView style={[styles.container, style]} testID={testID}>
      {/* Header */}
      {showHeader && (
        <View style={styles.header}>
          <View style={styles.headerContent}>
            {showAvatar && (
              <View style={styles.headerAvatar}>
                <Text style={styles.headerAvatarText}>A</Text>
              </View>
            )}
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>{headerTitle}</Text>
              <Text style={styles.headerStatus}>
                {isTyping ? 'Typing...' : 'Online'}
              </Text>
            </View>
          </View>

          {onClose && (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              testID={`${testID}-close`}
            >
              <CloseIcon color={theme.textColor} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Messages */}
      <MessageList
        messages={messages}
        isTyping={isTyping && !isStreaming}
        streamingContent={isStreaming ? streamingContent : undefined}
        showAvatar={showAvatar}
        avatarUrl={avatarUrl}
        testID={`${testID}-messages`}
      />

      {/* Composer */}
      <MessageComposer
        value={inputText}
        onChangeText={setInputText}
        onSend={handleSend}
        onVoicePress={handleVoicePress}
        placeholder={placeholder}
        disabled={isSending || isStreaming}
        enableVoice={enableVoice}
        enableAttachments={enableAttachments}
        testID={`${testID}-composer`}
      />
    </SafeAreaView>
  );
}

// ----------------------------------------------------------------------------
// Chat Bubble (Floating variant)
// ----------------------------------------------------------------------------

export interface AgentChatBubbleProps {
  /** Whether the chat bubble is expanded/open */
  isOpen: boolean;
  /** Toggle the chat open/closed */
  onToggle: () => void;
  /** Initial message */
  initialMessage?: string;
  /** Header title */
  headerTitle?: string;
  /** Enable voice input */
  enableVoice?: boolean;
  /** Test ID */
  testID?: string;
}

/**
 * Chat interface as a floating bubble/card
 */
export function AgentChatBubble({
  isOpen,
  onToggle,
  initialMessage,
  headerTitle = 'Assistant',
  enableVoice = false,
  testID,
}: AgentChatBubbleProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  if (!isOpen) {
    return null;
  }

  return (
    <View style={styles.bubbleContainer} testID={testID}>
      <View style={styles.bubbleCard}>
        <AgentChat
          initialMessage={initialMessage}
          headerTitle={headerTitle}
          enableVoice={enableVoice}
          onClose={onToggle}
          showHeader={true}
          testID={`${testID}-chat`}
        />
      </View>
    </View>
  );
}

// ----------------------------------------------------------------------------
// Icons
// ----------------------------------------------------------------------------

interface IconProps {
  color: string;
  size?: number;
}

function CloseIcon({ color, size = 24 }: IconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          position: 'absolute',
          width: size * 0.7,
          height: 2,
          backgroundColor: color,
          transform: [{ rotate: '45deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: size * 0.7,
          height: 2,
          backgroundColor: color,
          transform: [{ rotate: '-45deg' }],
        }}
      />
    </View>
  );
}

// ----------------------------------------------------------------------------
// Styles
// ----------------------------------------------------------------------------

function createStyles(theme: AgentTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.backgroundColor,
    } as ViewStyle,

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacingMd,
      paddingVertical: theme.spacingSm,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderColor,
      backgroundColor: theme.surfaceColor,
    } as ViewStyle,

    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    } as ViewStyle,

    headerAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.primaryColor,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacingSm,
    } as ViewStyle,

    headerAvatarText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    } as TextStyle,

    headerInfo: {
      flex: 1,
    } as ViewStyle,

    headerTitle: {
      fontSize: theme.fontSizeLarge,
      fontWeight: '600',
      color: theme.textColor,
    } as TextStyle,

    headerStatus: {
      fontSize: theme.fontSizeSmall,
      color: theme.textSecondaryColor,
    } as TextStyle,

    closeButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    // Bubble styles
    bubbleContainer: {
      position: 'absolute',
      bottom: 80,
      right: 16,
      left: 16,
      maxHeight: '70%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    } as ViewStyle,

    bubbleCard: {
      flex: 1,
      borderRadius: theme.cardRadius,
      overflow: 'hidden',
      backgroundColor: theme.backgroundColor,
      maxHeight: 500,
    } as ViewStyle,
  });
}
