// ============================================================================
// VOZIA AGENT SDK - SUPPORT SCREEN COMPONENT
// ============================================================================

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ViewStyle,
  TextStyle,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useTheme } from '../ThemeProvider';
import { AgentChat } from '../chat/AgentChat';
import type { AgentTheme, CreateTicketData, TicketPriority } from '../../types';

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export interface SupportScreenProps {
  /** Show chat option */
  enableChat?: boolean;
  /** Show ticket form */
  enableTickets?: boolean;
  /** Header title */
  title?: string;
  /** Called when ticket is submitted */
  onSubmitTicket?: (data: CreateTicketData) => Promise<void>;
  /** Called when screen is closed */
  onClose?: () => void;
  testID?: string;
}

type SupportTab = 'chat' | 'ticket';

// ----------------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------------

/**
 * Support screen with chat and ticket submission
 */
export function SupportScreen({
  enableChat = true,
  enableTickets = true,
  title = 'Support',
  onSubmitTicket,
  onClose,
  testID,
}: SupportScreenProps) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [activeTab, setActiveTab] = useState<SupportTab>(
    enableChat ? 'chat' : 'ticket'
  );

  return (
    <SafeAreaView style={styles.container} testID={testID}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <CloseIcon color={theme.textColor} />
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      {enableChat && enableTickets && (
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'chat' && styles.tabActive]}
            onPress={() => setActiveTab('chat')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'chat' && styles.tabTextActive,
              ]}
            >
              Chat
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'ticket' && styles.tabActive]}
            onPress={() => setActiveTab('ticket')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'ticket' && styles.tabTextActive,
              ]}
            >
              Submit Ticket
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      {activeTab === 'chat' && enableChat ? (
        <AgentChat
          showHeader={false}
          initialMessage="Hello! How can I help you today?"
          testID={`${testID}-chat`}
        />
      ) : (
        <TicketForm onSubmit={onSubmitTicket} testID={`${testID}-form`} />
      )}
    </SafeAreaView>
  );
}

// ----------------------------------------------------------------------------
// Ticket Form
// ----------------------------------------------------------------------------

interface TicketFormProps {
  onSubmit?: (data: CreateTicketData) => Promise<void>;
  testID?: string;
}

function TicketForm({ onSubmit, testID }: TicketFormProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!subject.trim() || !description.trim()) {
      Alert.alert('Error', 'Please fill in the subject and description');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit?.({
        subject: subject.trim(),
        description: description.trim(),
        email: email.trim() || undefined,
        name: name.trim() || undefined,
        priority,
      });

      Alert.alert('Success', 'Your ticket has been submitted!', [
        {
          text: 'OK',
          onPress: () => {
            // Clear form
            setSubject('');
            setDescription('');
            setEmail('');
            setName('');
            setPriority('medium');
          },
        },
      ]);
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to submit ticket. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [subject, description, email, name, priority, onSubmit]);

  return (
    <ScrollView
      style={styles.formContainer}
      contentContainerStyle={styles.formContent}
      testID={testID}
    >
      {/* Name */}
      <View style={styles.field}>
        <Text style={styles.label}>Name (optional)</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor={theme.textSecondaryColor}
        />
      </View>

      {/* Email */}
      <View style={styles.field}>
        <Text style={styles.label}>Email (optional)</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="your@email.com"
          placeholderTextColor={theme.textSecondaryColor}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* Subject */}
      <View style={styles.field}>
        <Text style={styles.label}>Subject *</Text>
        <TextInput
          style={styles.input}
          value={subject}
          onChangeText={setSubject}
          placeholder="Brief description of your issue"
          placeholderTextColor={theme.textSecondaryColor}
        />
      </View>

      {/* Priority */}
      <View style={styles.field}>
        <Text style={styles.label}>Priority</Text>
        <View style={styles.priorityContainer}>
          {(['low', 'medium', 'high', 'urgent'] as TicketPriority[]).map(
            (p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.priorityButton,
                  priority === p && styles.priorityButtonActive,
                  priority === p && {
                    backgroundColor: getPriorityColor(p, theme),
                  },
                ]}
                onPress={() => setPriority(p)}
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
            )
          )}
        </View>
      </View>

      {/* Description */}
      <View style={styles.field}>
        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Please describe your issue in detail..."
          placeholderTextColor={theme.textSecondaryColor}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
      </View>

      {/* Submit */}
      <TouchableOpacity
        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <Text style={styles.submitButtonText}>
          {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ----------------------------------------------------------------------------
// Ticket List (for viewing submitted tickets)
// ----------------------------------------------------------------------------

export interface TicketListProps {
  tickets: Array<{
    id: string;
    subject: string;
    status: string;
    priority: TicketPriority;
    createdAt: Date;
  }>;
  onTicketPress?: (id: string) => void;
  testID?: string;
}

export function TicketList({ tickets, onTicketPress, testID }: TicketListProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  if (tickets.length === 0) {
    return (
      <View style={styles.emptyContainer} testID={testID}>
        <Text style={styles.emptyText}>No tickets yet</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.ticketList} testID={testID}>
      {tickets.map((ticket) => (
        <TouchableOpacity
          key={ticket.id}
          style={styles.ticketItem}
          onPress={() => onTicketPress?.(ticket.id)}
        >
          <View style={styles.ticketHeader}>
            <Text style={styles.ticketSubject} numberOfLines={1}>
              {ticket.subject}
            </Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(ticket.status, theme) },
              ]}
            >
              <Text style={styles.statusText}>{ticket.status}</Text>
            </View>
          </View>
          <View style={styles.ticketFooter}>
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: getPriorityColor(ticket.priority, theme) + '20' },
              ]}
            >
              <Text
                style={[
                  styles.priorityBadgeText,
                  { color: getPriorityColor(ticket.priority, theme) },
                ]}
              >
                {ticket.priority}
              </Text>
            </View>
            <Text style={styles.ticketDate}>
              {ticket.createdAt.toLocaleDateString()}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

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

function getStatusColor(status: string, theme: AgentTheme): string {
  switch (status.toLowerCase()) {
    case 'open':
      return theme.primaryColor;
    case 'in_progress':
      return '#F59E0B';
    case 'resolved':
      return theme.successColor;
    case 'closed':
      return theme.textSecondaryColor;
    default:
      return theme.textSecondaryColor;
  }
}

// ----------------------------------------------------------------------------
// Icons
// ----------------------------------------------------------------------------

function CloseIcon({ color, size = 24 }: { color: string; size?: number }) {
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

    tabs: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: theme.borderColor,
    } as ViewStyle,

    tab: {
      flex: 1,
      paddingVertical: theme.spacingMd,
      alignItems: 'center',
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    } as ViewStyle,

    tabActive: {
      borderBottomColor: theme.primaryColor,
    } as ViewStyle,

    tabText: {
      fontSize: theme.fontSizeMedium,
      color: theme.textSecondaryColor,
    } as TextStyle,

    tabTextActive: {
      color: theme.primaryColor,
      fontWeight: '600',
    } as TextStyle,

    formContainer: {
      flex: 1,
    } as ViewStyle,

    formContent: {
      padding: theme.spacingMd,
    } as ViewStyle,

    field: {
      marginBottom: theme.spacingMd,
    } as ViewStyle,

    label: {
      fontSize: theme.fontSizeMedium,
      fontWeight: '500',
      color: theme.textColor,
      marginBottom: theme.spacingXs,
    } as TextStyle,

    input: {
      backgroundColor: theme.surfaceColor,
      borderWidth: 1,
      borderColor: theme.borderColor,
      borderRadius: theme.inputRadius,
      paddingHorizontal: theme.spacingMd,
      paddingVertical: theme.spacingSm,
      fontSize: theme.fontSizeMedium,
      color: theme.textColor,
    } as TextStyle,

    textArea: {
      minHeight: 120,
      paddingTop: theme.spacingSm,
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
    } as TextStyle,

    priorityTextActive: {
      color: '#FFFFFF',
      fontWeight: '600',
    } as TextStyle,

    submitButton: {
      backgroundColor: theme.primaryColor,
      paddingVertical: theme.spacingMd,
      borderRadius: theme.buttonRadius,
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

    // Ticket list styles
    ticketList: {
      flex: 1,
    } as ViewStyle,

    ticketItem: {
      padding: theme.spacingMd,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderColor,
    } as ViewStyle,

    ticketHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacingSm,
    } as ViewStyle,

    ticketSubject: {
      flex: 1,
      fontSize: theme.fontSizeMedium,
      fontWeight: '500',
      color: theme.textColor,
      marginRight: theme.spacingSm,
    } as TextStyle,

    statusBadge: {
      paddingHorizontal: theme.spacingSm,
      paddingVertical: 2,
      borderRadius: 4,
    } as ViewStyle,

    statusText: {
      fontSize: theme.fontSizeSmall,
      color: '#FFFFFF',
      fontWeight: '500',
    } as TextStyle,

    ticketFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    } as ViewStyle,

    priorityBadge: {
      paddingHorizontal: theme.spacingSm,
      paddingVertical: 2,
      borderRadius: 4,
    } as ViewStyle,

    priorityBadgeText: {
      fontSize: theme.fontSizeSmall,
      fontWeight: '500',
      textTransform: 'capitalize',
    } as TextStyle,

    ticketDate: {
      fontSize: theme.fontSizeSmall,
      color: theme.textSecondaryColor,
    } as TextStyle,

    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacingXl,
    } as ViewStyle,

    emptyText: {
      fontSize: theme.fontSizeMedium,
      color: theme.textSecondaryColor,
    } as TextStyle,
  });
}
