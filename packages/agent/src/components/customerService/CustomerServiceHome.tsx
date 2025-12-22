// ============================================================================
// VOZIA AGENT SDK - CUSTOMER SERVICE HOME
// ============================================================================

import React, { useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Animated,
  Platform,
} from 'react-native';
import { useTheme } from '../ThemeProvider';
import type { AgentTheme } from '../../types';
import type { CustomerServiceHomeProps, CustomerServiceScreen, CustomerServiceConfig } from './types';
import { DEFAULT_LABELS } from './constants';

// ----------------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------------

/**
 * Home screen with quick actions grid
 */
export function CustomerServiceHome({
  config,
  onNavigate,
  testID,
}: CustomerServiceHomeProps) {
  const theme = useTheme();
  const styles = createStyles(theme, config);
  const labels = { ...DEFAULT_LABELS, ...config.labels };

  // Determine which actions to show
  const actions = getAvailableActions(config, labels);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      testID={testID}
    >
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeTitle}>
          {config.welcomeMessage || labels.welcomeMessage}
        </Text>
        {config.companyName && (
          <Text style={styles.welcomeSubtitle}>
            {labels.headerSubtitle}
          </Text>
        )}
      </View>

      {/* Quick Actions Grid */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>{labels.quickActionsTitle}</Text>
        <View style={styles.actionsGrid}>
          {actions.map((action, index) => (
            <ActionCard
              key={action.screen}
              icon={action.icon}
              title={action.title}
              description={action.description}
              onPress={() => onNavigate(action.screen)}
              theme={theme}
              config={config}
              testID={`${testID}-action-${action.screen}`}
              index={index}
            />
          ))}
        </View>
      </View>

      {/* Powered by footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>{labels.poweredBy}</Text>
      </View>
    </ScrollView>
  );
}

// ----------------------------------------------------------------------------
// Action Card Component
// ----------------------------------------------------------------------------

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onPress: () => void;
  theme: AgentTheme;
  config: CustomerServiceConfig;
  testID?: string;
  index: number;
}

function ActionCard({
  icon,
  title,
  description,
  onPress,
  theme,
  config,
  testID,
  index,
}: ActionCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const styles = createCardStyles(theme, config);

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

  // Staggered entrance animation
  const translateY = useRef(new Animated.Value(20)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const delay = index * 80;
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, translateY, opacity]);

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          transform: [{ scale: scaleAnim }, { translateY }],
          opacity,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        testID={testID}
      >
        <View style={styles.cardIconContainer}>
          {icon}
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.cardDescription} numberOfLines={2}>
            {description}
          </Text>
        </View>
        <View style={styles.cardArrow}>
          <ChevronRightIcon color={theme.textSecondaryColor} size={20} />
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

function ChatIcon({ color, size = 24 }: IconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: size * 0.85,
          height: size * 0.7,
          backgroundColor: color,
          borderRadius: size * 0.18,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View style={{ flexDirection: 'row', gap: size * 0.08 }}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={{
                width: size * 0.1,
                height: size * 0.1,
                borderRadius: size * 0.05,
                backgroundColor: 'rgba(255,255,255,0.9)',
              }}
            />
          ))}
        </View>
      </View>
      <View
        style={{
          position: 'absolute',
          bottom: size * 0.05,
          right: size * 0.15,
          width: 0,
          height: 0,
          borderLeftWidth: size * 0.08,
          borderRightWidth: size * 0.08,
          borderTopWidth: size * 0.12,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderTopColor: color,
        }}
      />
    </View>
  );
}

function FAQIcon({ color, size = 24 }: IconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: size * 0.8,
          height: size * 0.8,
          borderRadius: size * 0.4,
          backgroundColor: color,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            fontSize: size * 0.45,
            fontWeight: '700',
            color: '#FFFFFF',
          }}
        >
          ?
        </Text>
      </View>
    </View>
  );
}

function TicketIcon({ color, size = 24 }: IconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: size * 0.75,
          height: size * 0.9,
          backgroundColor: color,
          borderRadius: size * 0.1,
        }}
      >
        {/* Lines */}
        {[0.25, 0.45, 0.65].map((top) => (
          <View
            key={top}
            style={{
              position: 'absolute',
              top: `${top * 100}%`,
              left: '15%',
              width: '70%',
              height: 2,
              backgroundColor: 'rgba(255,255,255,0.8)',
              borderRadius: 1,
            }}
          />
        ))}
      </View>
    </View>
  );
}

function CallIcon({ color, size = 24 }: IconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: size * 0.7,
          height: size * 0.7,
          backgroundColor: color,
          borderRadius: size * 0.35,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: size * 0.35,
            height: size * 0.35,
            borderWidth: 2,
            borderColor: '#FFFFFF',
            borderRadius: size * 0.06,
            borderTopWidth: 0,
            borderRightWidth: 0,
            transform: [{ rotate: '45deg' }],
          }}
        />
      </View>
    </View>
  );
}

function ChevronRightIcon({ color, size = 24 }: IconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: size * 0.35,
          height: size * 0.35,
          borderRightWidth: 2,
          borderBottomWidth: 2,
          borderColor: color,
          transform: [{ rotate: '-45deg' }],
          marginLeft: -size * 0.1,
        }}
      />
    </View>
  );
}

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

interface ActionItem {
  screen: CustomerServiceScreen;
  icon: React.ReactNode;
  title: string;
  description: string;
}

function getAvailableActions(
  config: CustomerServiceConfig,
  labels: typeof DEFAULT_LABELS
): ActionItem[] {
  const actions: ActionItem[] = [];
  const primaryColor = config.theme?.primaryColor || '#6366F1';

  if (config.enableChat !== false) {
    actions.push({
      screen: 'chat',
      icon: <ChatIcon color={primaryColor} size={28} />,
      title: labels.chatTitle,
      description: labels.chatDescription,
    });
  }

  if (config.enableFAQ !== false) {
    actions.push({
      screen: 'faq',
      icon: <FAQIcon color={primaryColor} size={28} />,
      title: labels.faqTitle,
      description: labels.faqDescription,
    });
  }

  if (config.enableTickets !== false) {
    actions.push({
      screen: 'tickets',
      icon: <TicketIcon color={primaryColor} size={28} />,
      title: labels.ticketsTitle,
      description: labels.ticketsDescription,
    });
  }

  if (config.enablePhoneCall || config.enableVoiceChat) {
    actions.push({
      screen: 'call',
      icon: <CallIcon color={primaryColor} size={28} />,
      title: labels.callTitle,
      description: labels.callDescription,
    });
  }

  return actions;
}

// ----------------------------------------------------------------------------
// Styles
// ----------------------------------------------------------------------------

function createStyles(theme: AgentTheme, config: CustomerServiceConfig) {
  const customTheme = config.theme || {};
  const contentPadding = customTheme.contentPadding || theme.spacingMd;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: customTheme.backgroundColor || theme.backgroundColor,
    } as ViewStyle,

    content: {
      padding: contentPadding,
      paddingBottom: contentPadding * 2,
    } as ViewStyle,

    welcomeSection: {
      marginBottom: theme.spacingLg,
      paddingTop: theme.spacingSm,
    } as ViewStyle,

    welcomeTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: customTheme.textColor || theme.textColor,
      letterSpacing: -0.5,
      marginBottom: theme.spacingXs,
    } as TextStyle,

    welcomeSubtitle: {
      fontSize: theme.fontSizeMedium,
      color: customTheme.textSecondaryColor || theme.textSecondaryColor,
    } as TextStyle,

    actionsContainer: {
      marginBottom: theme.spacingLg,
    } as ViewStyle,

    sectionTitle: {
      fontSize: theme.fontSizeSmall,
      fontWeight: '600',
      color: customTheme.textSecondaryColor || theme.textSecondaryColor,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: theme.spacingMd,
    } as TextStyle,

    actionsGrid: {
      gap: theme.spacingMd,
    } as ViewStyle,

    footer: {
      alignItems: 'center',
      paddingTop: theme.spacingXl,
    } as ViewStyle,

    footerText: {
      fontSize: theme.fontSizeSmall,
      color: theme.textSecondaryColor,
      opacity: 0.6,
    } as TextStyle,
  });
}

function createCardStyles(theme: AgentTheme, config: CustomerServiceConfig) {
  const customTheme = config.theme || {};
  const borderRadius = customTheme.cardBorderRadius || theme.cardRadius;

  return StyleSheet.create({
    cardWrapper: {
      width: '100%',
    } as ViewStyle,

    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: customTheme.cardBackgroundColor || theme.surfaceColor,
      borderRadius,
      padding: theme.spacingMd,
      borderWidth: 1,
      borderColor: customTheme.cardBorderColor || theme.borderColor,
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
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: `${customTheme.primaryColor || theme.primaryColor}15`,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacingMd,
    } as ViewStyle,

    cardContent: {
      flex: 1,
    } as ViewStyle,

    cardTitle: {
      fontSize: theme.fontSizeMedium,
      fontWeight: '600',
      color: customTheme.textColor || theme.textColor,
      marginBottom: 2,
    } as TextStyle,

    cardDescription: {
      fontSize: theme.fontSizeSmall,
      color: customTheme.textSecondaryColor || theme.textSecondaryColor,
      lineHeight: theme.fontSizeSmall * 1.4,
    } as TextStyle,

    cardArrow: {
      marginLeft: theme.spacingSm,
      opacity: 0.5,
    } as ViewStyle,
  });
}
