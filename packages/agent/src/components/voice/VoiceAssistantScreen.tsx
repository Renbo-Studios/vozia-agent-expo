// ============================================================================
// VOZIA AGENT SDK - VOICE ASSISTANT SCREEN COMPONENT
// ============================================================================

import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useTheme } from '../ThemeProvider';
import { WaveformVisualizer } from './WaveformVisualizer';
import { PushToTalkButton } from './PushToTalkButton';
import { useVoice } from '../../hooks/useVoice';
import type { AgentTheme, VoiceAssistantScreenProps } from '../../types';

// ----------------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------------

/**
 * Full-screen voice assistant interface
 *
 * @example
 * ```tsx
 * <VoiceAssistantScreen
 *   voiceConfig={{
 *     pushToTalk: true,
 *     voiceId: 'Puck',
 *   }}
 *   showTranscript={true}
 *   onSessionEnd={() => navigation.goBack()}
 * />
 * ```
 */
export function VoiceAssistantScreen({
  voiceConfig,
  showTranscript = true,
  waveformColor,
  onSessionEnd,
  style,
  testID,
}: VoiceAssistantScreenProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  const {
    state,
    isInitialized,
    isRecording,
    isPlaying,
    isProcessing,
    audioLevels,
    currentLevel,
    transcription,
    responseText,
    error,
    config,
    initialize,
    startRecording,
    stopRecording,
    toggleRecording,
    setConfig,
    reset,
  } = useVoice({
    config: voiceConfig,
    onRecordingStart: () => {
      // Optional: Track analytics
    },
    onRecordingStop: (duration) => {
      // Optional: Track analytics
    },
    onResponseEnd: (text) => {
      // Optional: Track analytics
    },
  });

  // Initialize voice service on mount
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  // Apply voice config
  useEffect(() => {
    if (voiceConfig) {
      setConfig(voiceConfig);
    }
  }, [voiceConfig, setConfig]);

  // Handle close
  const handleClose = useCallback(() => {
    reset();
    onSessionEnd?.();
  }, [reset, onSessionEnd]);

  // Handle push-to-talk
  const handleRecordStart = useCallback(() => {
    startRecording();
  }, [startRecording]);

  const handleRecordStop = useCallback(() => {
    stopRecording();
  }, [stopRecording]);

  // Handle tap-to-toggle
  const handleToggle = useCallback(() => {
    toggleRecording();
  }, [toggleRecording]);

  // Get status message
  const getStatusMessage = () => {
    switch (state) {
      case 'recording':
        return 'Listening...';
      case 'processing':
        return 'Processing...';
      case 'playing':
        return 'Speaking...';
      case 'error':
        return error || 'An error occurred';
      default:
        return config.pushToTalk
          ? 'Hold to speak'
          : 'Tap the button to start';
    }
  };

  return (
    <SafeAreaView style={[styles.container, style]} testID={testID}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Voice Assistant</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
          testID={`${testID}-close`}
        >
          <CloseIcon color={theme.textColor} />
        </TouchableOpacity>
      </View>

      {/* Main content */}
      <View style={styles.content}>
        {/* Waveform visualizer */}
        <View style={styles.visualizerContainer}>
          <WaveformVisualizer
            levels={audioLevels}
            currentLevel={currentLevel}
            isActive={isRecording || isPlaying}
            color={waveformColor || theme.primaryColor}
            height={120}
            variant={isRecording ? 'bars' : 'circle'}
            barCount={30}
            testID={`${testID}-waveform`}
          />
        </View>

        {/* Status message */}
        <Text style={styles.statusText}>{getStatusMessage()}</Text>

        {/* Transcript area */}
        {showTranscript && (
          <ScrollView
            style={styles.transcriptContainer}
            contentContainerStyle={styles.transcriptContent}
          >
            {transcription && (
              <View style={styles.transcriptBubble}>
                <Text style={styles.transcriptLabel}>You said:</Text>
                <Text style={styles.transcriptText}>{transcription}</Text>
              </View>
            )}

            {responseText && (
              <View style={[styles.transcriptBubble, styles.responseBubble]}>
                <Text style={styles.transcriptLabel}>Assistant:</Text>
                <Text style={styles.transcriptText}>{responseText}</Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>

      {/* Bottom controls */}
      <View style={styles.controls}>
        <PushToTalkButton
          isRecording={isRecording}
          isProcessing={isProcessing}
          audioLevel={currentLevel}
          pushToTalk={config.pushToTalk}
          size="large"
          onRecordStart={handleRecordStart}
          onRecordStop={handleRecordStop}
          onPress={handleToggle}
          disabled={!isInitialized || isPlaying}
          testID={`${testID}-ptt`}
        />
      </View>

      {/* Error message */}
      {error && state === 'error' && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => reset()}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

// ----------------------------------------------------------------------------
// Compact Voice Button (for embedding)
// ----------------------------------------------------------------------------

export interface CompactVoiceButtonProps {
  onPress: () => void;
  isActive?: boolean;
  size?: number;
  testID?: string;
}

/**
 * Compact voice button for embedding in other screens
 */
export function CompactVoiceButton({
  onPress,
  isActive = false,
  size = 48,
  testID,
}: CompactVoiceButtonProps) {
  const theme = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: isActive ? theme.primaryColor : theme.surfaceColor,
        borderWidth: 1,
        borderColor: isActive ? theme.primaryColor : theme.borderColor,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      testID={testID}
    >
      <View>
        <View
          style={{
            width: size * 0.22,
            height: size * 0.35,
            backgroundColor: isActive ? '#FFFFFF' : theme.textSecondaryColor,
            borderRadius: size * 0.11,
          }}
        />
        <View
          style={{
            width: size * 0.35,
            height: size * 0.06,
            backgroundColor: isActive ? '#FFFFFF' : theme.textSecondaryColor,
            marginTop: 2,
            borderRadius: size * 0.03,
          }}
        />
      </View>
    </TouchableOpacity>
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
    } as ViewStyle,

    title: {
      fontSize: theme.fontSizeLarge,
      fontWeight: '600',
      color: theme.textColor,
    } as TextStyle,

    closeButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    content: {
      flex: 1,
      alignItems: 'center',
      paddingTop: theme.spacingXl,
    } as ViewStyle,

    visualizerContainer: {
      height: 160,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacingLg,
    } as ViewStyle,

    statusText: {
      fontSize: theme.fontSizeMedium,
      color: theme.textSecondaryColor,
      textAlign: 'center',
      marginBottom: theme.spacingLg,
    } as TextStyle,

    transcriptContainer: {
      flex: 1,
      width: '100%',
      paddingHorizontal: theme.spacingMd,
    } as ViewStyle,

    transcriptContent: {
      paddingBottom: theme.spacingMd,
    } as ViewStyle,

    transcriptBubble: {
      backgroundColor: theme.surfaceColor,
      borderRadius: theme.cardRadius,
      padding: theme.spacingMd,
      marginBottom: theme.spacingSm,
    } as ViewStyle,

    responseBubble: {
      backgroundColor: theme.primaryColor + '15',
    } as ViewStyle,

    transcriptLabel: {
      fontSize: theme.fontSizeSmall,
      color: theme.textSecondaryColor,
      marginBottom: theme.spacingXs,
    } as TextStyle,

    transcriptText: {
      fontSize: theme.fontSizeMedium,
      color: theme.textColor,
      lineHeight: theme.fontSizeMedium * 1.5,
    } as TextStyle,

    controls: {
      paddingVertical: theme.spacingXl,
      paddingHorizontal: theme.spacingMd,
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: theme.borderColor,
    } as ViewStyle,

    errorContainer: {
      position: 'absolute',
      bottom: 200,
      left: theme.spacingMd,
      right: theme.spacingMd,
      backgroundColor: theme.errorColor + '15',
      borderRadius: theme.cardRadius,
      padding: theme.spacingMd,
      alignItems: 'center',
    } as ViewStyle,

    errorText: {
      color: theme.errorColor,
      fontSize: theme.fontSizeMedium,
      textAlign: 'center',
      marginBottom: theme.spacingSm,
    } as TextStyle,

    retryButton: {
      paddingHorizontal: theme.spacingMd,
      paddingVertical: theme.spacingSm,
      backgroundColor: theme.errorColor,
      borderRadius: theme.buttonRadius,
    } as ViewStyle,

    retryButtonText: {
      color: '#FFFFFF',
      fontSize: theme.fontSizeMedium,
      fontWeight: '600',
    } as TextStyle,
  });
}
