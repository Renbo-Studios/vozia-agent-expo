// ============================================================================
// VOZIA AGENT SDK - CUSTOMER SERVICE CHAT
// ============================================================================

import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../ThemeProvider';
import { AgentChat } from '../chat/AgentChat';
import type { AgentTheme } from '../../types';
import type { CustomerServiceChatProps } from './types';
import { DEFAULT_LABELS } from './constants';
import { CustomerServiceHeader } from './CustomerServiceHeader';

// ----------------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------------

/**
 * Chat screen within CustomerService
 * Wraps the existing AgentChat with CustomerService header
 */
export function CustomerServiceChat({
  config,
  onBack,
  testID,
}: CustomerServiceChatProps) {
  const theme = useTheme();
  const styles = createStyles(theme, config);
  const labels = { ...DEFAULT_LABELS, ...config.labels };

  return (
    <View style={styles.container} testID={testID}>
      {/* Header */}
      <CustomerServiceHeader
        title={labels.chatTitle}
        logo={config.logo}
        showBackButton={true}
        showCloseButton={false}
        onBack={onBack}
        testID={`${testID}-header`}
      />

      {/* Chat */}
      <View style={styles.chatContainer}>
        <AgentChat
          showHeader={false}
          initialMessage={labels.chatInitialMessage}
          placeholder={labels.chatPlaceholder}
          enableVoice={config.enableVoiceChat}
          testID={`${testID}-chat`}
        />
      </View>
    </View>
  );
}

// ----------------------------------------------------------------------------
// Styles
// ----------------------------------------------------------------------------

function createStyles(theme: AgentTheme, config: any) {
  const customTheme = config.theme || {};

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: customTheme.backgroundColor || theme.backgroundColor,
    } as ViewStyle,

    chatContainer: {
      flex: 1,
    } as ViewStyle,
  });
}
