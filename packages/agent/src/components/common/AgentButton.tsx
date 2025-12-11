// ============================================================================
// VOZIA AGENT SDK - AGENT BUTTON COMPONENT
// ============================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Dimensions,
} from 'react-native';
import { useTheme } from '../ThemeProvider';
import { AgentChat } from '../chat/AgentChat';
import { useAgentButton } from '../../hooks/useAgentButton';
import type { AgentTheme, AgentButtonProps, ButtonPosition } from '../../types';

// ----------------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------------

/**
 * Floating agent button that opens a chat modal
 *
 * @example
 * ```tsx
 * <AgentButton
 *   position="bottom-right"
 *   size={56}
 *   hapticFeedback={true}
 * />
 * ```
 */
export function AgentButton({
  position = 'bottom-right',
  icon,
  size = 56,
  hapticFeedback = true,
  onPress,
  style,
  testID,
}: AgentButtonProps) {
  const theme = useTheme();
  const styles = createStyles(theme, position, size);

  const {
    isOpen,
    unreadCount,
    toggleOpen,
    open,
    close,
    triggerHaptic,
  } = useAgentButton({
    position,
    hapticFeedback,
    onPress,
  });

  // Handle button press
  const handlePress = () => {
    if (hapticFeedback) {
      triggerHaptic();
    }

    if (onPress) {
      onPress();
    } else {
      toggleOpen();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <TouchableOpacity
        style={[styles.button, style]}
        onPress={handlePress}
        activeOpacity={0.8}
        testID={testID}
      >
        {icon || <ChatIcon color="#FFFFFF" size={size * 0.5} />}

        {/* Unread badge */}
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Chat Modal */}
      <Modal
        visible={isOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={close}
      >
        <AgentChat
          showHeader={true}
          headerTitle="Assistant"
          onClose={close}
          enableVoice={true}
          testID={`${testID}-chat`}
        />
      </Modal>
    </>
  );
}

// ----------------------------------------------------------------------------
// Customizable Floating Button
// ----------------------------------------------------------------------------

export interface FloatingButtonProps {
  onPress: () => void;
  position?: ButtonPosition;
  size?: number;
  backgroundColor?: string;
  icon?: React.ReactNode;
  badge?: number;
  disabled?: boolean;
  testID?: string;
}

/**
 * Generic floating action button
 */
export function FloatingButton({
  onPress,
  position = 'bottom-right',
  size = 56,
  backgroundColor,
  icon,
  badge,
  disabled = false,
  testID,
}: FloatingButtonProps) {
  const theme = useTheme();
  const styles = createStyles(theme, position, size);

  return (
    <TouchableOpacity
      style={[
        styles.button,
        backgroundColor ? { backgroundColor } : undefined,
        disabled && styles.buttonDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      testID={testID}
    >
      {icon || <ChatIcon color="#FFFFFF" size={size * 0.5} />}

      {badge !== undefined && badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ----------------------------------------------------------------------------
// Agent FAB with Bottom Sheet
// ----------------------------------------------------------------------------

export interface AgentFABProps {
  position?: ButtonPosition;
  size?: number;
  greeting?: string;
  headerTitle?: string;
  enableVoice?: boolean;
  testID?: string;
}

/**
 * Floating action button with integrated bottom sheet chat
 */
export function AgentFAB({
  position = 'bottom-right',
  size = 56,
  greeting,
  headerTitle = 'Agent',
  enableVoice = false,
  testID,
}: AgentFABProps) {
  const theme = useTheme();
  const styles = createStyles(theme, position, size);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleOpen = () => {
    setIsOpen(true);
    setUnreadCount(0);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleOpen}
        activeOpacity={0.8}
        testID={testID}
      >
        <ChatIcon color="#FFFFFF" size={size * 0.5} />

        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Bottom Sheet Modal */}
      <Modal
        visible={isOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={handleClose}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            onPress={handleClose}
            activeOpacity={1}
          />
          <View style={styles.bottomSheet}>
            <View style={styles.bottomSheetHandle} />
            <AgentChat
              initialMessage={greeting}
              showHeader={true}
              headerTitle={headerTitle}
              onClose={handleClose}
              enableVoice={enableVoice}
              testID={`${testID}-chat`}
            />
          </View>
        </View>
      </Modal>
    </>
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
      {/* Chat bubble shape */}
      <View
        style={{
          width: size * 0.85,
          height: size * 0.7,
          backgroundColor: color,
          borderRadius: size * 0.15,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Dots */}
        <View style={{ flexDirection: 'row', gap: size * 0.08 }}>
          <View
            style={{
              width: size * 0.12,
              height: size * 0.12,
              borderRadius: size * 0.06,
              backgroundColor: 'rgba(0,0,0,0.3)',
            }}
          />
          <View
            style={{
              width: size * 0.12,
              height: size * 0.12,
              borderRadius: size * 0.06,
              backgroundColor: 'rgba(0,0,0,0.3)',
            }}
          />
          <View
            style={{
              width: size * 0.12,
              height: size * 0.12,
              borderRadius: size * 0.06,
              backgroundColor: 'rgba(0,0,0,0.3)',
            }}
          />
        </View>
      </View>
      {/* Tail */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          right: size * 0.1,
          width: 0,
          height: 0,
          borderLeftWidth: size * 0.1,
          borderRightWidth: size * 0.1,
          borderTopWidth: size * 0.15,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderTopColor: color,
        }}
      />
    </View>
  );
}

// ----------------------------------------------------------------------------
// Styles
// ----------------------------------------------------------------------------

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

function createStyles(
  theme: AgentTheme,
  position: ButtonPosition,
  size: number
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
    button: {
      position: 'absolute',
      ...positionStyles,
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: theme.primaryColor,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6,
      zIndex: 1000,
    } as ViewStyle,

    buttonDisabled: {
      opacity: 0.5,
    } as ViewStyle,

    badge: {
      position: 'absolute',
      top: -4,
      right: -4,
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: theme.errorColor,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 6,
    } as ViewStyle,

    badgeText: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '700',
    } as TextStyle,

    modalOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
    } as ViewStyle,

    modalBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    } as ViewStyle,

    bottomSheet: {
      height: SCREEN_HEIGHT * 0.75,
      backgroundColor: theme.backgroundColor,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      overflow: 'hidden',
    } as ViewStyle,

    bottomSheetHandle: {
      width: 40,
      height: 4,
      backgroundColor: theme.borderColor,
      borderRadius: 2,
      alignSelf: 'center',
      marginTop: 8,
      marginBottom: 4,
    } as ViewStyle,
  });
}
