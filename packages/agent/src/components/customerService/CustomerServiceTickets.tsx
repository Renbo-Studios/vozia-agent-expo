// ============================================================================
// VOZIA AGENT SDK - CUSTOMER SERVICE TICKETS
// ============================================================================

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../ThemeProvider';
import type { AgentTheme, TicketPriority } from '../../types';
import type { CustomerServiceTicketsProps, CustomerServiceTicketData } from './types';
import { DEFAULT_LABELS } from './constants';
import { CustomerServiceHeader } from './CustomerServiceHeader';

// ----------------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------------

/**
 * Ticket submission screen
 */
export function CustomerServiceTickets({
  config,
  onBack,
  testID,
}: CustomerServiceTicketsProps) {
  const theme = useTheme();
  const styles = createStyles(theme, config);
  const labels = { ...DEFAULT_LABELS, ...config.labels };

  // Form state
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Animation for success
  const successAnim = useRef(new Animated.Value(0)).current;

  const validateForm = useCallback(() => {
    if (!subject.trim()) {
      Alert.alert(labels.ticketErrorTitle, 'Please enter a subject');
      return false;
    }
    if (!description.trim()) {
      Alert.alert(labels.ticketErrorTitle, 'Please enter a description');
      return false;
    }
    if (email && !isValidEmail(email)) {
      Alert.alert(labels.ticketErrorTitle, 'Please enter a valid email address');
      return false;
    }
    return true;
  }, [subject, description, email, labels]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    const ticketData: CustomerServiceTicketData = {
      subject: subject.trim(),
      description: description.trim(),
      email: email.trim() || undefined,
      name: name.trim() || undefined,
      priority,
    };

    try {
      if (config.onTicketSubmit) {
        await config.onTicketSubmit(ticketData);
      }

      // Show success animation
      setShowSuccess(true);
      Animated.sequence([
        Animated.timing(successAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(successAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowSuccess(false);
        // Reset form
        setSubject('');
        setDescription('');
        setEmail('');
        setName('');
        setPriority('medium');
        // Go back
        onBack();
      });
    } catch (error) {
      Alert.alert(labels.ticketErrorTitle, labels.ticketErrorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    validateForm,
    subject,
    description,
    email,
    name,
    priority,
    config.onTicketSubmit,
    successAnim,
    labels,
    onBack,
  ]);

  if (showSuccess) {
    return (
      <View style={styles.container} testID={testID}>
        <CustomerServiceHeader
          title={labels.ticketsTitle}
          logo={config.logo}
          showBackButton={true}
          showCloseButton={false}
          onBack={onBack}
          testID={`${testID}-header`}
        />
        <View style={styles.successContainer}>
          <Animated.View
            style={[
              styles.successContent,
              {
                opacity: successAnim,
                transform: [
                  {
                    scale: successAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.successIcon}>
              <CheckIcon color="#FFFFFF" size={32} />
            </View>
            <Text style={styles.successTitle}>{labels.ticketSuccessTitle}</Text>
            <Text style={styles.successMessage}>{labels.ticketSuccessMessage}</Text>
          </Animated.View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container} testID={testID}>
      {/* Header */}
      <CustomerServiceHeader
        title={labels.ticketsTitle}
        logo={config.logo}
        showBackButton={true}
        showCloseButton={false}
        onBack={onBack}
        testID={`${testID}-header`}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Name */}
          <View style={styles.field}>
            <Text style={styles.label}>
              {labels.ticketNameLabel}
              <Text style={styles.optional}> (optional)</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder={labels.ticketNamePlaceholder}
              placeholderTextColor={theme.textSecondaryColor}
              autoCapitalize="words"
              testID={`${testID}-name`}
            />
          </View>

          {/* Email */}
          <View style={styles.field}>
            <Text style={styles.label}>
              {labels.ticketEmailLabel}
              <Text style={styles.optional}> (optional)</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder={labels.ticketEmailPlaceholder}
              placeholderTextColor={theme.textSecondaryColor}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              testID={`${testID}-email`}
            />
          </View>

          {/* Subject */}
          <View style={styles.field}>
            <Text style={styles.label}>
              {labels.ticketSubjectLabel}
              <Text style={styles.required}> *</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={subject}
              onChangeText={setSubject}
              placeholder={labels.ticketSubjectPlaceholder}
              placeholderTextColor={theme.textSecondaryColor}
              testID={`${testID}-subject`}
            />
          </View>

          {/* Priority */}
          <View style={styles.field}>
            <Text style={styles.label}>{labels.ticketPriorityLabel}</Text>
            <View style={styles.priorityContainer}>
              {(['low', 'medium', 'high', 'urgent'] as TicketPriority[]).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.priorityButton,
                    priority === p && styles.priorityButtonActive,
                    priority === p && { backgroundColor: getPriorityColor(p, theme) },
                  ]}
                  onPress={() => setPriority(p)}
                  testID={`${testID}-priority-${p}`}
                >
                  <Text
                    style={[
                      styles.priorityText,
                      priority === p && styles.priorityTextActive,
                    ]}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Description */}
          <View style={styles.field}>
            <Text style={styles.label}>
              {labels.ticketDescriptionLabel}
              <Text style={styles.required}> *</Text>
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder={labels.ticketDescriptionPlaceholder}
              placeholderTextColor={theme.textSecondaryColor}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              testID={`${testID}-description`}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            testID={`${testID}-submit`}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? labels.ticketSubmitting : labels.ticketSubmitButton}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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

function CheckIcon({ color, size = 24 }: IconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: size * 0.5,
          height: size * 0.3,
          borderLeftWidth: 3,
          borderBottomWidth: 3,
          borderColor: color,
          transform: [{ rotate: '-45deg' }],
          marginTop: -size * 0.1,
        }}
      />
    </View>
  );
}

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function getPriorityColor(priority: TicketPriority, theme: AgentTheme): string {
  switch (priority) {
    case 'low':
      return theme.successColor;
    case 'medium':
      return theme.primaryColor;
    case 'high':
      return '#F59E0B'; // Orange
    case 'urgent':
      return theme.errorColor;
    default:
      return theme.textSecondaryColor;
  }
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

    keyboardView: {
      flex: 1,
    } as ViewStyle,

    scrollView: {
      flex: 1,
    } as ViewStyle,

    scrollContent: {
      padding: theme.spacingMd,
      paddingBottom: theme.spacingXl,
    } as ViewStyle,

    field: {
      marginBottom: theme.spacingMd,
    } as ViewStyle,

    label: {
      fontSize: theme.fontSizeMedium,
      fontWeight: '500',
      color: customTheme.textColor || theme.textColor,
      marginBottom: theme.spacingXs,
    } as TextStyle,

    required: {
      color: theme.errorColor,
    } as TextStyle,

    optional: {
      color: theme.textSecondaryColor,
      fontWeight: '400',
    } as TextStyle,

    input: {
      backgroundColor: theme.surfaceColor,
      borderWidth: 1,
      borderColor: theme.borderColor,
      borderRadius: theme.inputRadius,
      paddingHorizontal: theme.spacingMd,
      paddingVertical: theme.spacingSm + 4,
      fontSize: theme.fontSizeMedium,
      color: theme.textColor,
    } as TextStyle,

    textArea: {
      minHeight: 120,
      paddingTop: theme.spacingSm + 4,
    } as ViewStyle,

    priorityContainer: {
      flexDirection: 'row',
      gap: theme.spacingSm,
    } as ViewStyle,

    priorityButton: {
      flex: 1,
      paddingVertical: theme.spacingSm,
      paddingHorizontal: theme.spacingXs,
      borderRadius: theme.buttonRadius,
      borderWidth: 1,
      borderColor: theme.borderColor,
      alignItems: 'center',
    } as ViewStyle,

    priorityButtonActive: {
      borderColor: 'transparent',
    } as ViewStyle,

    priorityText: {
      fontSize: theme.fontSizeSmall,
      color: theme.textSecondaryColor,
      fontWeight: '500',
    } as TextStyle,

    priorityTextActive: {
      color: '#FFFFFF',
      fontWeight: '600',
    } as TextStyle,

    submitButton: {
      backgroundColor: customTheme.primaryColor || theme.primaryColor,
      paddingVertical: theme.spacingMd,
      borderRadius: customTheme.buttonBorderRadius || theme.buttonRadius,
      alignItems: 'center',
      marginTop: theme.spacingMd,
    } as ViewStyle,

    submitButtonDisabled: {
      opacity: 0.6,
    } as ViewStyle,

    submitButtonText: {
      color: '#FFFFFF',
      fontSize: theme.fontSizeMedium,
      fontWeight: '600',
    } as TextStyle,

    // Success state
    successContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacingXl,
    } as ViewStyle,

    successContent: {
      alignItems: 'center',
    } as ViewStyle,

    successIcon: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: theme.successColor,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacingLg,
    } as ViewStyle,

    successTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.textColor,
      marginBottom: theme.spacingSm,
    } as TextStyle,

    successMessage: {
      fontSize: theme.fontSizeMedium,
      color: theme.textSecondaryColor,
      textAlign: 'center',
    } as TextStyle,
  });
}
