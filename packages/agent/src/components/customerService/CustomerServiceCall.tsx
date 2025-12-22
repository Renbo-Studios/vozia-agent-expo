// ============================================================================
// VOZIA AGENT SDK - CUSTOMER SERVICE CALL
// ============================================================================

import React, { useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Linking,
  Alert,
  Animated,
  Platform,
} from 'react-native';
import { useTheme } from '../ThemeProvider';
import { useVoice } from '../../hooks';
import type { AgentTheme } from '../../types';
import type { CustomerServiceCallProps } from './types';
import { DEFAULT_LABELS } from './constants';
import { CustomerServiceHeader } from './CustomerServiceHeader';

// ----------------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------------

/**
 * Call options screen with phone and voice chat
 */
export function CustomerServiceCall({
  config,
  onBack,
  testID,
}: CustomerServiceCallProps) {
  const theme = useTheme();
  const styles = createStyles(theme, config);
  const labels = { ...DEFAULT_LABELS, ...config.labels };

  // Voice hook for in-app voice chat
  const { isRecording, startRecording, stopRecording, isProcessing } = useVoice({
    onError: (error) => {
      Alert.alert('Voice Error', error.message);
    },
  });

  const handlePhoneCall = useCallback(async () => {
    if (!config.phoneNumber) {
      Alert.alert('Error', 'Phone number is not configured');
      return;
    }

    const phoneUrl = Platform.select({
      ios: `tel:${config.phoneNumber}`,
      android: `tel:${config.phoneNumber}`,
      default: `tel:${config.phoneNumber}`,
    });

    try {
      const canOpen = await Linking.canOpenURL(phoneUrl);
      if (canOpen) {
        if (config.onPhoneCall) {
          config.onPhoneCall(config.phoneNumber);
        }
        await Linking.openURL(phoneUrl);
      } else {
        Alert.alert('Error', 'Cannot open phone app');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to initiate phone call');
    }
  }, [config.phoneNumber, config.onPhoneCall]);

  const handleVoiceChat = useCallback(async () => {
    if (config.onVoiceChatStart) {
      config.onVoiceChatStart();
    }

    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  }, [isRecording, startRecording, stopRecording, config.onVoiceChatStart]);

  const showPhoneCall = config.enablePhoneCall && config.phoneNumber;
  const showVoiceChat = config.enableVoiceChat;

  return (
    <View style={styles.container} testID={testID}>
      {/* Header */}
      <CustomerServiceHeader
        title={labels.callTitle}
        logo={config.logo}
        showBackButton={true}
        showCloseButton={false}
        onBack={onBack}
        testID={`${testID}-header`}
      />

      <View style={styles.content}>
        {/* Phone Call Option */}
        {showPhoneCall && (
          <CallOptionCard
            icon={<PhoneIcon color={theme.primaryColor} size={32} />}
            title={labels.callPhoneTitle}
            description={labels.callPhoneDescription}
            subtitle={config.phoneNumber}
            onPress={handlePhoneCall}
            theme={theme}
            config={config}
            testID={`${testID}-phone`}
          />
        )}

        {/* Voice Chat Option */}
        {showVoiceChat && (
          <CallOptionCard
            icon={
              <MicIcon
                color={isRecording ? theme.errorColor : theme.primaryColor}
                size={32}
              />
            }
            title={labels.callVoiceTitle}
            description={labels.callVoiceDescription}
            subtitle={
              isRecording
                ? 'Listening...'
                : isProcessing
                ? 'Processing...'
                : 'Tap to start'
            }
            onPress={handleVoiceChat}
            theme={theme}
            config={config}
            isActive={isRecording}
            testID={`${testID}-voice`}
          />
        )}

        {/* Email fallback if neither is available */}
        {!showPhoneCall && !showVoiceChat && config.supportEmail && (
          <CallOptionCard
            icon={<EmailIcon color={theme.primaryColor} size={32} />}
            title="Email Support"
            description="Send us an email"
            subtitle={config.supportEmail}
            onPress={() => {
              Linking.openURL(`mailto:${config.supportEmail}`);
            }}
            theme={theme}
            config={config}
            testID={`${testID}-email`}
          />
        )}

        {/* No options available */}
        {!showPhoneCall && !showVoiceChat && !config.supportEmail && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Call options are not currently available.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

// ----------------------------------------------------------------------------
// Call Option Card
// ----------------------------------------------------------------------------

interface CallOptionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  subtitle?: string;
  onPress: () => void;
  theme: AgentTheme;
  config: any;
  isActive?: boolean;
  testID?: string;
}

function CallOptionCard({
  icon,
  title,
  description,
  subtitle,
  onPress,
  theme,
  config,
  isActive = false,
  testID,
}: CallOptionCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const styles = createCardStyles(theme, config, isActive);

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        testID={testID}
      >
        <View style={styles.cardIconContainer}>{icon}</View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardDescription}>{description}</Text>
          {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
        </View>
        <View style={styles.cardAction}>
          <View style={styles.actionButton}>
            <ArrowRightIcon color="#FFFFFF" size={20} />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ----------------------------------------------------------------------------
// Icons
// ----------------------------------------------------------------------------

interface IconProps {
  color: string;
  size?: number;
}

function PhoneIcon({ color, size = 24 }: IconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: size * 0.6,
          height: size * 0.85,
          backgroundColor: color,
          borderRadius: size * 0.15,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Screen */}
        <View
          style={{
            width: size * 0.45,
            height: size * 0.5,
            backgroundColor: 'rgba(255,255,255,0.3)',
            borderRadius: size * 0.08,
            marginTop: -size * 0.05,
          }}
        />
        {/* Home button */}
        <View
          style={{
            width: size * 0.15,
            height: size * 0.15,
            borderRadius: size * 0.075,
            borderWidth: 1.5,
            borderColor: 'rgba(255,255,255,0.5)',
            marginTop: size * 0.05,
          }}
        />
      </View>
    </View>
  );
}

function MicIcon({ color, size = 24 }: IconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      {/* Mic body */}
      <View
        style={{
          width: size * 0.4,
          height: size * 0.6,
          backgroundColor: color,
          borderRadius: size * 0.2,
          marginBottom: size * 0.05,
        }}
      />
      {/* Stand */}
      <View
        style={{
          position: 'absolute',
          bottom: size * 0.1,
          width: size * 0.6,
          height: size * 0.25,
          borderBottomLeftRadius: size * 0.3,
          borderBottomRightRadius: size * 0.3,
          borderWidth: 2.5,
          borderTopWidth: 0,
          borderColor: color,
        }}
      />
      {/* Base */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          width: size * 0.3,
          height: 2.5,
          backgroundColor: color,
          borderRadius: 1.25,
        }}
      />
    </View>
  );
}

function EmailIcon({ color, size = 24 }: IconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: size * 0.85,
          height: size * 0.6,
          backgroundColor: color,
          borderRadius: size * 0.08,
          overflow: 'hidden',
        }}
      >
        {/* Envelope flap */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: size * 0.085,
            width: size * 0.68,
            height: size * 0.4,
            backgroundColor: 'rgba(255,255,255,0.2)',
            transform: [{ rotate: '45deg' }, { translateY: -size * 0.15 }],
          }}
        />
      </View>
    </View>
  );
}

function ArrowRightIcon({ color, size = 24 }: IconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: size * 0.35,
          height: size * 0.35,
          borderRightWidth: 2.5,
          borderBottomWidth: 2.5,
          borderColor: color,
          transform: [{ rotate: '-45deg' }],
          marginLeft: -size * 0.08,
        }}
      />
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

    content: {
      flex: 1,
      padding: theme.spacingMd,
      gap: theme.spacingMd,
    } as ViewStyle,

    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacingXl,
    } as ViewStyle,

    emptyText: {
      fontSize: theme.fontSizeMedium,
      color: theme.textSecondaryColor,
      textAlign: 'center',
    } as TextStyle,
  });
}

function createCardStyles(theme: AgentTheme, config: any, isActive: boolean) {
  const customTheme = config.theme || {};

  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: customTheme.cardBackgroundColor || theme.surfaceColor,
      borderRadius: customTheme.cardBorderRadius || theme.cardRadius,
      padding: theme.spacingMd,
      borderWidth: isActive ? 2 : 1,
      borderColor: isActive
        ? theme.errorColor
        : customTheme.cardBorderColor || theme.borderColor,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
        },
        android: {
          elevation: 2,
        },
      }),
    } as ViewStyle,

    cardIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 16,
      backgroundColor: `${customTheme.primaryColor || theme.primaryColor}15`,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacingMd,
    } as ViewStyle,

    cardContent: {
      flex: 1,
    } as ViewStyle,

    cardTitle: {
      fontSize: theme.fontSizeLarge,
      fontWeight: '600',
      color: customTheme.textColor || theme.textColor,
      marginBottom: 2,
    } as TextStyle,

    cardDescription: {
      fontSize: theme.fontSizeMedium,
      color: customTheme.textSecondaryColor || theme.textSecondaryColor,
      marginBottom: 4,
    } as TextStyle,

    cardSubtitle: {
      fontSize: theme.fontSizeSmall,
      color: theme.primaryColor,
      fontWeight: '500',
    } as TextStyle,

    cardAction: {
      marginLeft: theme.spacingSm,
    } as ViewStyle,

    actionButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: customTheme.primaryColor || theme.primaryColor,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,
  });
}
