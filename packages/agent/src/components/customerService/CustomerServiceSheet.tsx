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
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../ThemeProvider';
import type { AgentTheme } from '../../types';
import type { CustomerServiceSheetProps, CustomerServiceScreen, CustomerServiceConfig, FAQItem } from './types';
import { DEFAULT_CONFIG, LAYOUT, ANIMATION_CONFIG, DEFAULT_LABELS } from './constants';
import { CustomerServiceHeader } from './CustomerServiceHeader';
import { CustomerServiceHome } from './CustomerServiceHome';
import { CustomerServiceChat } from './CustomerServiceChat';
import { CustomerServiceFAQ } from './CustomerServiceFAQ';
import { CustomerServiceTickets } from './CustomerServiceTickets';
import { CustomerServiceCall } from './CustomerServiceCall';
import { AgentClient } from '../../core/AgentClient';

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

  // State for merged config (DB + user config)
  const [mergedConfig, setMergedConfig] = useState<CustomerServiceConfig>(() => mergeConfig(userConfig));
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);
  const configFetchedRef = useRef(false);

  // Fetch config from backend and merge with user config
  useEffect(() => {
    if (visible && !configFetchedRef.current) {
      configFetchedRef.current = true;

      const fetchAndMergeConfig = async () => {
        try {
          setIsLoadingConfig(true);

          if (AgentClient.hasInstance()) {
            const dbConfig = await AgentClient.getInstance().getCustomerServiceConfig();

            if (dbConfig) {
              // Merge configs: user config overrides DB config, FAQs are combined
              const merged = mergeConfigWithDb(dbConfig, userConfig);
              setMergedConfig(merged);
            }
          }
        } catch (error) {
          console.warn('[CustomerServiceSheet] Failed to fetch config from backend:', error);
        } finally {
          setIsLoadingConfig(false);
        }
      };

      fetchAndMergeConfig();
    }
  }, [visible, userConfig]);

  // Reset fetch flag when sheet closes
  useEffect(() => {
    if (!visible) {
      configFetchedRef.current = false;
    }
  }, [visible]);

  const config = mergedConfig;
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
            onClose={handleClose}
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

        {/* Header (hidden for home screen as it has custom header) */}
        {currentScreen !== 'home' && (
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

/**
 * Merge database config with user config
 * - User config overrides DB config for most fields
 * - FAQs are combined (DB FAQs + user FAQs, avoiding duplicates)
 */
function mergeConfigWithDb(
  dbConfig: Record<string, any>,
  userConfig?: CustomerServiceConfig
): CustomerServiceConfig {
  // Start with defaults
  const baseConfig = { ...DEFAULT_CONFIG };

  // Apply DB config
  const dbMerged = {
    ...baseConfig,
    ...dbConfig,
    theme: {
      ...baseConfig.theme,
      ...dbConfig.theme,
    },
    labels: {
      ...DEFAULT_LABELS,
      ...dbConfig.labels,
    },
  };

  // If no user config, return DB merged config
  if (!userConfig) {
    return dbMerged;
  }

  // Merge FAQs: combine DB FAQs with user FAQs (avoid duplicates by question)
  const dbFaqs = extractFaqs(dbConfig.faqs);
  const userFaqs = extractFaqs(userConfig.faqs);

  // Use question text as key to avoid duplicates (case-insensitive)
  const faqMap = new Map<string, FAQItem>();

  // Add DB FAQs first
  dbFaqs.forEach((faq) => {
    faqMap.set(faq.question.toLowerCase().trim(), faq);
  });

  // Add/override with user FAQs
  userFaqs.forEach((faq) => {
    faqMap.set(faq.question.toLowerCase().trim(), faq);
  });

  const combinedFaqs = Array.from(faqMap.values());

  // User config overrides DB config for other fields
  return {
    ...dbMerged,
    ...userConfig,
    // Combined FAQs
    faqs: combinedFaqs,
    // Deep merge theme
    theme: {
      ...dbMerged.theme,
      ...userConfig.theme,
    },
    // Deep merge labels
    labels: {
      ...dbMerged.labels,
      ...userConfig.labels,
    },
  };
}

/**
 * Extract FAQs array from various source formats
 */
function extractFaqs(faqs: any): FAQItem[] {
  if (!faqs) return [];

  // If it's already an array, return it
  if (Array.isArray(faqs)) {
    return faqs.filter((f): f is FAQItem => f && typeof f.question === 'string' && typeof f.answer === 'string');
  }

  // If it's a FAQSource object with type 'static'
  if (faqs.type === 'static' && Array.isArray(faqs.data)) {
    return faqs.data.filter((f: any): f is FAQItem => f && typeof f.question === 'string' && typeof f.answer === 'string');
  }

  // For API sources, return empty (will be fetched separately)
  return [];
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
