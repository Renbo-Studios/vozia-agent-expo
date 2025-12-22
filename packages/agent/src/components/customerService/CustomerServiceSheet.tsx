// ============================================================================
// VOZIA AGENT SDK - CUSTOMER SERVICE SHEET
// ============================================================================

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Dimensions,
  Animated,
  PanResponder,
  Platform,
} from 'react-native';
import { useTheme } from '../ThemeProvider';
import type { AgentTheme } from '../../types';
import type { CustomerServiceSheetProps, CustomerServiceScreen, CustomerServiceConfig } from './types';
import { DEFAULT_CONFIG, LAYOUT, ANIMATION_CONFIG, DEFAULT_LABELS } from './constants';
import { CustomerServiceHeader } from './CustomerServiceHeader';
import { CustomerServiceHome } from './CustomerServiceHome';
import { CustomerServiceChat } from './CustomerServiceChat';
import { CustomerServiceFAQ } from './CustomerServiceFAQ';
import { CustomerServiceTickets } from './CustomerServiceTickets';
import { CustomerServiceCall } from './CustomerServiceCall';

// ----------------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------------

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * LAYOUT.sheetHeight;

/**
 * Main bottom sheet container for CustomerService
 */
export function CustomerServiceSheet({
  visible,
  onClose,
  config: userConfig,
  initialScreen = 'home',
  testID,
}: CustomerServiceSheetProps) {
  const theme = useTheme();
  const config = mergeConfig(userConfig);
  const styles = createStyles(theme, config);
  const labels = { ...DEFAULT_LABELS, ...config.labels };

  // Navigation state
  const [currentScreen, setCurrentScreen] = useState<CustomerServiceScreen>(initialScreen);
  const [history, setHistory] = useState<CustomerServiceScreen[]>([initialScreen]);

  // Animations
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Reset to home when sheet opens
  useEffect(() => {
    if (visible) {
      setCurrentScreen(initialScreen);
      setHistory([initialScreen]);
    }
  }, [visible, initialScreen]);

  // Animate sheet in/out
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: ANIMATION_CONFIG.sheet.damping,
          stiffness: ANIMATION_CONFIG.sheet.stiffness,
          mass: ANIMATION_CONFIG.sheet.mass,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: LAYOUT.backdropDuration,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: SHEET_HEIGHT,
          useNativeDriver: true,
          damping: ANIMATION_CONFIG.sheet.damping,
          stiffness: ANIMATION_CONFIG.sheet.stiffness,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: LAYOUT.backdropDuration,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, backdropOpacity]);

  // Drag to dismiss
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, { dy }) => dy > 10,
      onPanResponderMove: (_, { dy }) => {
        if (dy > 0) {
          translateY.setValue(dy);
        }
      },
      onPanResponderRelease: (_, { dy, vy }) => {
        if (dy > 100 || vy > 0.5) {
          handleClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            damping: ANIMATION_CONFIG.sheet.damping,
            stiffness: ANIMATION_CONFIG.sheet.stiffness,
          }).start();
        }
      },
    })
  ).current;

  // Navigation handlers
  const navigateTo = useCallback((screen: CustomerServiceScreen) => {
    setHistory((prev) => [...prev, screen]);
    setCurrentScreen(screen);
  }, []);

  const goBack = useCallback(() => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop();
      setHistory(newHistory);
      setCurrentScreen(newHistory[newHistory.length - 1]);
    }
  }, [history]);

  const handleClose = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SHEET_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  }, [translateY, backdropOpacity, onClose]);

  const canGoBack = history.length > 1;

  // Get header title for current screen
  const getHeaderTitle = useCallback(() => {
    switch (currentScreen) {
      case 'home':
        return config.companyName || labels.headerTitle;
      case 'chat':
        return labels.chatTitle;
      case 'faq':
        return labels.faqTitle;
      case 'tickets':
        return labels.ticketsTitle;
      case 'call':
        return labels.callTitle;
      default:
        return labels.headerTitle;
    }
  }, [currentScreen, config.companyName, labels]);

  // Render current screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <CustomerServiceHome
            config={config}
            onNavigate={navigateTo}
            testID={`${testID}-home`}
          />
        );
      case 'chat':
        return (
          <CustomerServiceChat
            config={config}
            onBack={goBack}
            testID={`${testID}-chat`}
          />
        );
      case 'faq':
        return (
          <CustomerServiceFAQ
            config={config}
            onBack={goBack}
            testID={`${testID}-faq`}
          />
        );
      case 'tickets':
        return (
          <CustomerServiceTickets
            config={config}
            onBack={goBack}
            testID={`${testID}-tickets`}
          />
        );
      case 'call':
        return (
          <CustomerServiceCall
            config={config}
            onBack={goBack}
            testID={`${testID}-call`}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
      testID={testID}
    >
      {/* Backdrop */}
      <Animated.View
        style={[
          styles.backdrop,
          { opacity: backdropOpacity },
        ]}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={handleClose}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          { transform: [{ translateY }] },
        ]}
      >
        {/* Handle */}
        <View {...panResponder.panHandlers} style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        {/* Header (only for home screen) */}
        {currentScreen === 'home' && (
          <CustomerServiceHeader
            title={getHeaderTitle()}
            subtitle={labels.headerSubtitle}
            logo={config.logo}
            showBackButton={false}
            showCloseButton={true}
            onClose={handleClose}
            testID={`${testID}-header`}
          />
        )}

        {/* Content */}
        <View style={styles.content}>
          {renderScreen()}
        </View>
      </Animated.View>
    </Modal>
  );
}

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

function mergeConfig(userConfig?: CustomerServiceConfig): CustomerServiceConfig {
  return {
    ...DEFAULT_CONFIG,
    ...userConfig,
    theme: {
      ...DEFAULT_CONFIG.theme,
      ...userConfig?.theme,
    },
    labels: {
      ...DEFAULT_LABELS,
      ...userConfig?.labels,
    },
  };
}

// ----------------------------------------------------------------------------
// Styles
// ----------------------------------------------------------------------------

function createStyles(theme: AgentTheme, config: CustomerServiceConfig) {
  const customTheme = config.theme || {};
  const borderRadius = customTheme.borderRadius || 20;

  return StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    } as ViewStyle,

    sheet: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: SHEET_HEIGHT,
      backgroundColor: customTheme.backgroundColor || theme.backgroundColor,
      borderTopLeftRadius: borderRadius,
      borderTopRightRadius: borderRadius,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
        },
        android: {
          elevation: 16,
        },
      }),
    } as ViewStyle,

    handleContainer: {
      alignItems: 'center',
      paddingTop: 12,
      paddingBottom: 8,
    } as ViewStyle,

    handle: {
      width: LAYOUT.handleWidth,
      height: LAYOUT.handleHeight,
      backgroundColor: theme.borderColor,
      borderRadius: LAYOUT.handleHeight / 2,
    } as ViewStyle,

    content: {
      flex: 1,
      overflow: 'hidden',
    } as ViewStyle,
  });
}
