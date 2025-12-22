// ============================================================================
// VOZIA AGENT SDK - CUSTOMER SERVICE HEADER
// ============================================================================

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';
import { useTheme } from '../ThemeProvider';
import type { AgentTheme } from '../../types';
import type { CustomerServiceHeaderProps } from './types';

// ----------------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------------

/**
 * Header component for CustomerService screens
 */
export function CustomerServiceHeader({
  title,
  subtitle,
  logo,
  showBackButton = false,
  showCloseButton = true,
  onBack,
  onClose,
  testID,
}: CustomerServiceHeaderProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container} testID={testID}>
      {/* Left section - Back button or spacer */}
      <View style={styles.leftSection}>
        {showBackButton && onBack ? (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            testID={`${testID}-back`}
          >
            <BackIcon color={theme.textColor} size={24} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconPlaceholder} />
        )}
      </View>

      {/* Center section - Logo and title */}
      <View style={styles.centerSection}>
        {logo && (
          <Image
            source={logo}
            style={styles.logo}
            resizeMode="contain"
            testID={`${testID}-logo`}
          />
        )}
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {/* Right section - Close button or spacer */}
      <View style={styles.rightSection}>
        {showCloseButton && onClose ? (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            testID={`${testID}-close`}
          >
            <CloseIcon color={theme.textColor} size={24} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconPlaceholder} />
        )}
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

function BackIcon({ color, size = 24 }: IconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      {/* Chevron left */}
      <View
        style={{
          width: size * 0.4,
          height: size * 0.4,
          borderLeftWidth: 2.5,
          borderBottomWidth: 2.5,
          borderColor: color,
          transform: [{ rotate: '45deg' }],
          marginLeft: size * 0.15,
        }}
      />
    </View>
  );
}

function CloseIcon({ color, size = 24 }: IconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          position: 'absolute',
          width: size * 0.6,
          height: 2.5,
          backgroundColor: color,
          borderRadius: 1.25,
          transform: [{ rotate: '45deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: size * 0.6,
          height: 2.5,
          backgroundColor: color,
          borderRadius: 1.25,
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
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacingMd,
      paddingVertical: theme.spacingSm,
      minHeight: 56,
      backgroundColor: theme.backgroundColor,
      // Removed borderBottomWidth
    } as ViewStyle,

    leftSection: {
      width: 44,
      alignItems: 'flex-start',
    } as ViewStyle,

    centerSection: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacingSm,
    } as ViewStyle,

    rightSection: {
      width: 44,
      alignItems: 'flex-end',
    } as ViewStyle,

    iconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      // Removed surfaceColor background for cleaner look, or make it very subtle
      backgroundColor: 'transparent', 
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    iconPlaceholder: {
      width: 40,
      height: 40,
    } as ViewStyle,

    logo: {
      width: 28, // Smaller logo to match new design
      height: 28,
      marginRight: theme.spacingSm,
    } as ImageStyle,

    titleContainer: {
      alignItems: 'center',
    } as ViewStyle,

    title: {
      fontSize: 17, // iOS standard style
      fontWeight: '600',
      color: theme.textColor,
      letterSpacing: -0.3,
    } as TextStyle,

    subtitle: {
      fontSize: 12,
      color: theme.textSecondaryColor,
      marginTop: 2,
    } as TextStyle,
  });
}
