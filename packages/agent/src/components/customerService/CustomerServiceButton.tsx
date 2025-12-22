// ============================================================================
// VOZIA AGENT SDK - CUSTOMER SERVICE BUTTON
// ============================================================================

import React, { useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Animated,
  Platform,
} from 'react-native';
import { useTheme } from '../ThemeProvider';
import type { AgentTheme, ButtonPosition } from '../../types';
import type { CustomerServiceButtonProps, CustomerServiceConfig, CustomerServiceScreen } from './types';
import { LAYOUT } from './constants';
import { CustomerServiceSheet } from './CustomerServiceSheet';
import {
  CustomerServiceContextProvider,
  useCustomerServiceContext,
} from './CustomerServiceContext';

// Optional haptics import
let Haptics: any = null;
try {
  Haptics = require('expo-haptics');
} catch {
  // expo-haptics not available
}

// ----------------------------------------------------------------------------
// Main Component (with integrated provider)
// ----------------------------------------------------------------------------

/**
 * Floating action button that opens CustomerService sheet
 * Includes its own context provider for state management
 */
export function CustomerServiceButton(props: CustomerServiceButtonProps) {
  return (
    <CustomerServiceContextProvider config={props.config}>
      <CustomerServiceButtonInner {...props} />
    </CustomerServiceContextProvider>
  );
}

// ----------------------------------------------------------------------------
// Inner Button Component
// ----------------------------------------------------------------------------

function CustomerServiceButtonInner({
  config,
  position = 'bottom-right',
  size = LAYOUT.fabSize,
  icon,
  hapticFeedback = true,
  backgroundColor,
  badgeCount = 0,
  visible = true,
  testID,
}: CustomerServiceButtonProps) {
  const theme = useTheme();
  const styles = createStyles(theme, position, size, backgroundColor);
  const { isVisible, open, close, currentScreen } = useCustomerServiceContext();

  // Animation for button entrance and press
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pressScaleAnim = useRef(new Animated.Value(1)).current;

  // Entrance animation
  useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        damping: 12,
        stiffness: 180,
      }).start();
    } else {
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, scaleAnim]);

  const triggerHaptic = useCallback(async () => {
    if (hapticFeedback && Haptics) {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // Haptics not supported
      }
    }
  }, [hapticFeedback]);

  const handlePressIn = useCallback(() => {
    Animated.spring(pressScaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [pressScaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(pressScaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [pressScaleAnim]);

  const handlePress = useCallback(() => {
    triggerHaptic();
    open('home');
  }, [triggerHaptic, open]);

  if (!visible) {
    return null;
  }

  return (
    <>
      {/* Floating Button */}
      <Animated.View
        style={[
          styles.container,
          {
            transform: [
              { scale: Animated.multiply(scaleAnim, pressScaleAnim) },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.button}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
          testID={testID}
        >
          {icon || <SupportIcon color="#FFFFFF" size={size * 0.5} />}
        </TouchableOpacity>

        {/* Badge */}
        {badgeCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {badgeCount > 99 ? '99+' : badgeCount}
            </Text>
          </View>
        )}
      </Animated.View>

      {/* Customer Service Sheet */}
      <CustomerServiceSheet
        visible={isVisible}
        onClose={close}
        config={config}
        initialScreen={currentScreen}
        testID={`${testID}-sheet`}
      />
    </>
  );
}

// ----------------------------------------------------------------------------
// Standalone Provider Component
// ----------------------------------------------------------------------------

export interface CustomerServiceProviderProps {
  config?: CustomerServiceConfig;
  children: React.ReactNode;
  /** Show the floating button (default: false for provider-only usage) */
  showButton?: boolean;
  /** Button position */
  buttonPosition?: ButtonPosition;
  /** Button size */
  buttonSize?: number;
}

/**
 * Provider that enables useCustomerService hook throughout your app
 * Can optionally render a floating button
 *
 * @example
 * ```tsx
 * // Provider with button
 * <CustomerServiceProvider config={config} showButton>
 *   <App />
 * </CustomerServiceProvider>
 *
 * // Provider without button (use useCustomerService to open)
 * <CustomerServiceProvider config={config}>
 *   <App />
 * </CustomerServiceProvider>
 * ```
 */
export function CustomerServiceProvider({
  config,
  children,
  showButton = false,
  buttonPosition = 'bottom-right',
  buttonSize = LAYOUT.fabSize,
}: CustomerServiceProviderProps) {
  return (
    <CustomerServiceContextProvider config={config}>
      {children}
      {showButton && (
        <CustomerServiceButtonWithContext
          position={buttonPosition}
          size={buttonSize}
          config={config}
        />
      )}
      <CustomerServiceSheetWithContext config={config} />
    </CustomerServiceContextProvider>
  );
}

// Helper component that uses context for button
function CustomerServiceButtonWithContext({
  position,
  size,
  config,
}: {
  position: ButtonPosition;
  size: number;
  config?: CustomerServiceConfig;
}) {
  const theme = useTheme();
  const styles = createStyles(theme, position, size, config?.theme?.primaryColor);
  const { open } = useCustomerServiceContext();

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pressScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      damping: 12,
      stiffness: 180,
    }).start();
  }, [scaleAnim]);

  const handlePressIn = useCallback(() => {
    Animated.spring(pressScaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [pressScaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(pressScaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [pressScaleAnim]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: Animated.multiply(scaleAnim, pressScaleAnim) }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.button}
        onPress={() => open('home')}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <SupportIcon color="#FFFFFF" size={size * 0.5} />
      </TouchableOpacity>
    </Animated.View>
  );
}

// Helper component that uses context for sheet
function CustomerServiceSheetWithContext({
  config,
}: {
  config?: CustomerServiceConfig;
}) {
  const { isVisible, close, currentScreen } = useCustomerServiceContext();

  return (
    <CustomerServiceSheet
      visible={isVisible}
      onClose={close}
      config={config}
      initialScreen={currentScreen}
    />
  );
}

// ----------------------------------------------------------------------------
// Icons
// ----------------------------------------------------------------------------

interface IconProps {
  color: string;
  size?: number;
}

function SupportIcon({ color, size = 24 }: IconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      {/* Headset shape */}
      <View
        style={{
          width: size * 0.8,
          height: size * 0.7,
          borderWidth: 3,
          borderColor: color,
          borderBottomWidth: 0,
          borderTopLeftRadius: size * 0.4,
          borderTopRightRadius: size * 0.4,
        }}
      />
      {/* Left ear cup */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          bottom: size * 0.15,
          width: size * 0.2,
          height: size * 0.35,
          backgroundColor: color,
          borderRadius: size * 0.05,
        }}
      />
      {/* Right ear cup */}
      <View
        style={{
          position: 'absolute',
          right: 0,
          bottom: size * 0.15,
          width: size * 0.2,
          height: size * 0.35,
          backgroundColor: color,
          borderRadius: size * 0.05,
        }}
      />
      {/* Mic */}
      <View
        style={{
          position: 'absolute',
          right: size * 0.05,
          bottom: 0,
          width: size * 0.25,
          height: size * 0.25,
          borderWidth: 2.5,
          borderColor: color,
          borderRadius: size * 0.125,
          borderTopWidth: 0,
        }}
      />
    </View>
  );
}

// ----------------------------------------------------------------------------
// Styles
// ----------------------------------------------------------------------------

function createStyles(
  theme: AgentTheme,
  position: ButtonPosition,
  size: number,
  customBackgroundColor?: string
) {
  const positionStyles: ViewStyle = {};

  switch (position) {
    case 'bottom-right':
      positionStyles.bottom = 24;
      positionStyles.right = 24;
      break;
    case 'bottom-left':
      positionStyles.bottom = 24;
      positionStyles.left = 24;
      break;
    case 'top-right':
      positionStyles.top = 60;
      positionStyles.right = 24;
      break;
    case 'top-left':
      positionStyles.top = 60;
      positionStyles.left = 24;
      break;
  }

  return StyleSheet.create({
    container: {
      position: 'absolute',
      ...positionStyles,
      zIndex: 999,
    } as ViewStyle,

    button: {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: customBackgroundColor || theme.primaryColor,
      justifyContent: 'center',
      alignItems: 'center',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
        },
        android: {
          elevation: 8,
        },
      }),
    } as ViewStyle,

    badge: {
      position: 'absolute',
      top: -4,
      right: -4,
      minWidth: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: theme.errorColor,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 6,
      borderWidth: 2,
      borderColor: theme.backgroundColor,
    } as ViewStyle,

    badgeText: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '700',
    } as TextStyle,
  });
}
