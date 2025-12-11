// ============================================================================
// VOZIA AGENT SDK - useAgentButton HOOK
// ============================================================================

import { useState, useCallback, useMemo } from 'react';
import type { ButtonPosition } from '../types';

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export interface UseAgentButtonOptions {
  /** Initial visibility state */
  initialVisible?: boolean;
  /** Initial open state */
  initialOpen?: boolean;
  /** Button position */
  position?: ButtonPosition;
  /** Enable haptic feedback */
  hapticFeedback?: boolean;
  /** Called when button is pressed */
  onPress?: () => void;
  /** Called when chat opens */
  onOpen?: () => void;
  /** Called when chat closes */
  onClose?: () => void;
}

export interface UseAgentButtonReturn {
  // State
  isVisible: boolean;
  isOpen: boolean;
  position: ButtonPosition;
  unreadCount: number;

  // Actions
  show: () => void;
  hide: () => void;
  toggle: () => void;
  open: () => void;
  close: () => void;
  toggleOpen: () => void;
  setPosition: (position: ButtonPosition) => void;
  setUnreadCount: (count: number) => void;
  incrementUnread: () => void;
  clearUnread: () => void;

  // Haptics
  triggerHaptic: () => void;
}

// ----------------------------------------------------------------------------
// Hook
// ----------------------------------------------------------------------------

/**
 * Hook for managing the floating agent button state
 */
export function useAgentButton(
  options: UseAgentButtonOptions = {}
): UseAgentButtonReturn {
  const [isVisible, setIsVisible] = useState(options.initialVisible ?? true);
  const [isOpen, setIsOpen] = useState(options.initialOpen ?? false);
  const [position, setPositionState] = useState<ButtonPosition>(
    options.position ?? 'bottom-right'
  );
  const [unreadCount, setUnreadCountState] = useState(0);

  // Trigger haptic feedback
  const triggerHaptic = useCallback(async () => {
    if (!options.hapticFeedback) return;

    try {
      const Haptics = await import('expo-haptics');
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics not available
    }
  }, [options.hapticFeedback]);

  // Show button
  const show = useCallback(() => {
    setIsVisible(true);
  }, []);

  // Hide button
  const hide = useCallback(() => {
    setIsVisible(false);
  }, []);

  // Toggle visibility
  const toggle = useCallback(() => {
    setIsVisible((prev) => !prev);
  }, []);

  // Open chat
  const open = useCallback(() => {
    setIsOpen(true);
    triggerHaptic();
    options.onOpen?.();
    // Clear unread when opening
    setUnreadCountState(0);
  }, [triggerHaptic, options]);

  // Close chat
  const close = useCallback(() => {
    setIsOpen(false);
    triggerHaptic();
    options.onClose?.();
  }, [triggerHaptic, options]);

  // Toggle open state
  const toggleOpen = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
    options.onPress?.();
  }, [isOpen, open, close, options]);

  // Set position
  const setPosition = useCallback((newPosition: ButtonPosition) => {
    setPositionState(newPosition);
  }, []);

  // Set unread count
  const setUnreadCount = useCallback((count: number) => {
    setUnreadCountState(Math.max(0, count));
  }, []);

  // Increment unread
  const incrementUnread = useCallback(() => {
    // Only increment if chat is not open
    if (!isOpen) {
      setUnreadCountState((prev) => prev + 1);
    }
  }, [isOpen]);

  // Clear unread
  const clearUnread = useCallback(() => {
    setUnreadCountState(0);
  }, []);

  return useMemo(
    () => ({
      // State
      isVisible,
      isOpen,
      position,
      unreadCount,

      // Actions
      show,
      hide,
      toggle,
      open,
      close,
      toggleOpen,
      setPosition,
      setUnreadCount,
      incrementUnread,
      clearUnread,

      // Haptics
      triggerHaptic,
    }),
    [
      isVisible,
      isOpen,
      position,
      unreadCount,
      show,
      hide,
      toggle,
      open,
      close,
      toggleOpen,
      setPosition,
      setUnreadCount,
      incrementUnread,
      clearUnread,
      triggerHaptic,
    ]
  );
}
