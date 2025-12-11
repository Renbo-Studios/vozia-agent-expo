// ============================================================================
// VOZIA AGENT SDK - MESSAGE LIST COMPONENT
// ============================================================================

import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ViewStyle,
  ListRenderItemInfo,
} from 'react-native';
import { useTheme } from '../ThemeProvider';
import { MessageBubble, TypingIndicator, AgentMessage } from './MessageBubble';
import type { Message, AgentTheme } from '../../types';

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export interface MessageListProps {
  messages: Message[];
  isTyping?: boolean;
  streamingContent?: string;
  showAvatar?: boolean;
  avatarUrl?: string;
  inverted?: boolean;
  onEndReached?: () => void;
  testID?: string;
}

// ----------------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------------

/**
 * Scrollable list of messages with auto-scroll to bottom
 */
export function MessageList({
  messages,
  isTyping = false,
  streamingContent,
  showAvatar = true,
  avatarUrl,
  inverted = true,
  onEndReached,
  testID,
}: MessageListProps) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const flatListRef = useRef<FlatList>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (flatListRef.current && messages.length > 0 && !inverted) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length, inverted]);

  // Render individual message
  const renderMessage = useCallback(
    ({ item }: ListRenderItemInfo<Message>) => (
      <MessageBubble
        message={item}
        showAvatar={showAvatar}
        avatarUrl={avatarUrl}
        testID={`message-${item.id}`}
      />
    ),
    [showAvatar, avatarUrl]
  );

  // Key extractor
  const keyExtractor = useCallback((item: Message) => item.id, []);

  // Get item layout for optimization
  const getItemLayout = useCallback(
    (_: ArrayLike<Message> | null | undefined, index: number) => ({
      length: 80, // Approximate height
      offset: 80 * index,
      index,
    }),
    []
  );

  // Prepare data (reverse for inverted list)
  const data = inverted ? [...messages].reverse() : messages;

  // Footer with typing indicator and streaming content
  const ListFooterComponent = useCallback(() => {
    if (!isTyping && !streamingContent) return null;

    return (
      <View style={styles.footer}>
        {streamingContent ? (
          <AgentMessage
            content={streamingContent}
            showAvatar={showAvatar}
            avatarUrl={avatarUrl}
            isStreaming={true}
            testID="streaming-message"
          />
        ) : isTyping ? (
          <TypingIndicator testID="typing-indicator" />
        ) : null}
      </View>
    );
  }, [isTyping, streamingContent, showAvatar, avatarUrl, styles.footer]);

  // Header component (shown at bottom in inverted list)
  const ListHeaderComponent = useCallback(() => {
    if (inverted) {
      // In inverted mode, header is at the bottom
      if (!isTyping && !streamingContent) return null;

      return (
        <View style={styles.footer}>
          {streamingContent ? (
            <AgentMessage
              content={streamingContent}
              showAvatar={showAvatar}
              avatarUrl={avatarUrl}
              isStreaming={true}
              testID="streaming-message"
            />
          ) : isTyping ? (
            <TypingIndicator testID="typing-indicator" />
          ) : null}
        </View>
      );
    }
    return null;
  }, [inverted, isTyping, streamingContent, showAvatar, avatarUrl, styles.footer]);

  return (
    <FlatList
      ref={flatListRef}
      data={data}
      renderItem={renderMessage}
      keyExtractor={keyExtractor}
      style={styles.list}
      contentContainerStyle={styles.contentContainer}
      inverted={inverted}
      showsVerticalScrollIndicator={false}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.1}
      ListHeaderComponent={inverted ? ListHeaderComponent : undefined}
      ListFooterComponent={inverted ? undefined : ListFooterComponent}
      getItemLayout={getItemLayout}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      testID={testID}
    />
  );
}

// ----------------------------------------------------------------------------
// Styles
// ----------------------------------------------------------------------------

function createStyles(theme: AgentTheme) {
  return StyleSheet.create({
    list: {
      flex: 1,
      backgroundColor: theme.backgroundColor,
    } as ViewStyle,

    contentContainer: {
      paddingVertical: theme.spacingMd,
      flexGrow: 1,
    } as ViewStyle,

    footer: {
      paddingBottom: theme.spacingSm,
    } as ViewStyle,
  });
}
