// ============================================================================
// CHAT SDK EXAMPLE SCREEN
// Demonstrates all Chat SDK components
// ============================================================================

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AgentChat } from '@vozia/agent';

// ============================================================================
// TYPES
// ============================================================================

interface ChatSDKExampleProps {
  onBack: () => void;
}

// ============================================================================
// THEME
// ============================================================================

const THEME = {
  primary: '#6366F1',
  secondary: '#4F46E5',
  background: '#0A0A0A',
  surface: '#141414',
  surfaceLight: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#A0A0A0',
  border: 'rgba(255,255,255,0.1)',
};

// ============================================================================
// COMPONENT
// ============================================================================

export function ChatSDKExample({ onBack }: ChatSDKExampleProps) {
  const insets = useSafeAreaInsets();
  const [showFullChat, setShowFullChat] = useState(false);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={THEME.text} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.headerText}>Chat SDK</Text>
          <Text style={styles.headerSubtext}>Interactive Examples</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Full Chat Demo Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: THEME.primary }]}>
              <Ionicons name="chatbubbles-outline" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>Full Chat Interface</Text>
              <Text style={styles.cardDescription}>
                Complete chat experience with streaming messages, typing indicators, and more
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.demoButton}
            onPress={() => setShowFullChat(true)}
          >
            <Text style={styles.demoButtonText}>Open Chat</Text>
            <Ionicons name="arrow-forward" size={18} color={THEME.primary} />
          </TouchableOpacity>
        </View>

        {/* Features Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: '#10B981' }]}>
              <Ionicons name="sparkles-outline" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>Features</Text>
              <Text style={styles.cardDescription}>
                What's included in the Chat SDK
              </Text>
            </View>
          </View>
          <View style={styles.featuresList}>
            {[
              { icon: 'flash-outline', text: 'Streaming responses', color: '#F59E0B' },
              { icon: 'attach-outline', text: 'File attachments', color: '#6366F1' },
              { icon: 'document-text-outline', text: 'Markdown support', color: '#8B5CF6' },
              { icon: 'ellipsis-horizontal-outline', text: 'Typing indicators', color: '#EC4899' },
              { icon: 'chatbubble-outline', text: 'Message bubbles', color: '#14B8A6' },
              { icon: 'create-outline', text: 'Message composer', color: '#F97316' },
            ].map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: feature.color + '20' }]}>
                  <Ionicons name={feature.icon as any} size={18} color={feature.color} />
                </View>
                <Text style={styles.featureText}>{feature.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Message Bubble Preview */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: '#8B5CF6' }]}>
              <Ionicons name="chatbubble-ellipses-outline" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>Message Bubbles</Text>
              <Text style={styles.cardDescription}>
                Beautiful chat bubbles for user and AI messages
              </Text>
            </View>
          </View>
          <View style={styles.messagePreview}>
            {/* User message */}
            <View style={styles.userMessageRow}>
              <View style={styles.userBubble}>
                <Text style={styles.userBubbleText}>Hello! How can you help me?</Text>
              </View>
            </View>

            {/* AI message */}
            <View style={styles.aiBubble}>
              <View style={styles.aiAvatar}>
                <Ionicons name="sparkles" size={16} color="#FFFFFF" />
              </View>
              <View style={styles.aiContent}>
                <Text style={styles.aiBubbleText}>
                  Hi there! I'm your AI assistant. I can help you with questions, tasks, and more. What would you like to know?
                </Text>
              </View>
            </View>

            {/* Typing indicator preview */}
            <View style={styles.aiBubble}>
              <View style={styles.aiAvatar}>
                <Ionicons name="sparkles" size={16} color="#FFFFFF" />
              </View>
              <View style={styles.typingIndicator}>
                <View style={styles.typingDot} />
                <View style={[styles.typingDot, { opacity: 0.6 }]} />
                <View style={[styles.typingDot, { opacity: 0.3 }]} />
              </View>
            </View>
          </View>
        </View>

        {/* Code Example */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: '#EF4444' }]}>
              <Ionicons name="code-slash-outline" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>Quick Integration</Text>
              <Text style={styles.cardDescription}>
                Add chat to your app with just a few lines
              </Text>
            </View>
          </View>
          <View style={styles.codeBlock}>
            <Text style={styles.codeText}>
              {`import { AgentChat } from '@vozia/agent';

<AgentChat
  showHeader={true}
  headerTitle="AI Assistant"
  enableVoice={true}
  onClose={() => goBack()}
/>`}
            </Text>
          </View>
        </View>

        {/* Composer Preview */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: '#F59E0B' }]}>
              <Ionicons name="create-outline" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>Message Composer</Text>
              <Text style={styles.cardDescription}>
                Rich input with attachments, voice, and emoji support
              </Text>
            </View>
          </View>
          <View style={styles.composerPreview}>
            <View style={styles.composerInput}>
              <TouchableOpacity style={styles.composerAction}>
                <Ionicons name="attach" size={22} color={THEME.textSecondary} />
              </TouchableOpacity>
              <View style={styles.composerTextArea}>
                <Text style={styles.composerPlaceholder}>Type a message...</Text>
              </View>
              <TouchableOpacity style={styles.composerAction}>
                <Ionicons name="mic" size={22} color={THEME.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.sendButton}>
                <Ionicons name="send" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={{ height: insets.bottom + 20 }} />
      </ScrollView>

      {/* Full Chat Modal */}
      <Modal
        visible={showFullChat}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowFullChat(false)}
      >
        <AgentChat
          showHeader={true}
          headerTitle="AI Assistant"
          enableVoice={true}
          onClose={() => setShowFullChat(false)}
        />
      </Modal>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.text,
  },
  headerSubtext: {
    fontSize: 12,
    color: THEME.textSecondary,
    marginTop: 2,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },

  // Card
  card: {
    backgroundColor: THEME.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: THEME.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.text,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: THEME.textSecondary,
    lineHeight: 20,
  },

  // Demo button
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: THEME.surfaceLight,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  demoButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME.primary,
  },

  // Features
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 15,
    color: THEME.text,
  },

  // Message preview
  messagePreview: {
    gap: 12,
  },
  userMessageRow: {
    alignItems: 'flex-end',
  },
  userBubble: {
    backgroundColor: THEME.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    borderBottomRightRadius: 4,
    maxWidth: '80%',
  },
  userBubbleText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 22,
  },
  aiBubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: THEME.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiContent: {
    flex: 1,
    backgroundColor: THEME.surfaceLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    borderTopLeftRadius: 4,
  },
  aiBubbleText: {
    color: THEME.text,
    fontSize: 15,
    lineHeight: 22,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: THEME.surfaceLight,
    borderRadius: 18,
    borderTopLeftRadius: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.textSecondary,
  },

  // Code block
  codeBlock: {
    backgroundColor: THEME.surfaceLight,
    borderRadius: 12,
    padding: 16,
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    color: THEME.textSecondary,
    lineHeight: 18,
  },

  // Composer preview
  composerPreview: {
    backgroundColor: THEME.surfaceLight,
    borderRadius: 12,
    padding: 8,
  },
  composerInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  composerAction: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  composerTextArea: {
    flex: 1,
    backgroundColor: THEME.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  composerPlaceholder: {
    color: THEME.textSecondary,
    fontSize: 15,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatSDKExample;
