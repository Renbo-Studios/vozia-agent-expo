import { StatusBar } from 'expo-status-bar';
import { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AgentProvider, useChat, useVoice } from '@vozia/agent';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';

// --- Dashboard Theme Colors ---
const THEME = {
  primary: '#4F46E5', // Indigo-600
  background: '#F9FAFB', // Gray-50
  surface: '#FFFFFF',
  text: '#111827', // Gray-900
  textSecondary: '#6B7280', // Gray-500
  border: '#E5E7EB', // Gray-200
  error: '#EF4444',
  success: '#10B981',
};

function ChatScreen() {
  const insets = useSafeAreaInsets();
  const [inputText, setInputText] = useState('');
  
  // Chat Hook
  const { 
    messages, 
    sendMessage, 
    isLoading, 
    isTyping, 
    isStreaming, 
    streamingContent,
    addMessage 
  } = useChat();

  // Voice Hook
  const {
    isRecording,
    startRecording,
    stopRecording,
    transcription,
    error: voiceError
  } = useVoice({
    onTranscription: (text, isFinal) => {
      if (isFinal) {
        setInputText(text);
      }
    },
    onError: (err) => {
      Alert.alert('Voice Error', err.message);
    }
  });

  // Handle Send
  const handleSend = useCallback(() => {
    if (inputText.trim() && !isLoading) {
      sendMessage(inputText.trim());
      setInputText('');
    }
  }, [inputText, isLoading, sendMessage]);

  // Handle Voice Toggle
  const handleVoiceToggle = useCallback(async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  // Handle File Upload
  const handleAttachment = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      // Simulate file attachment since backend upload endpoint is not exposed yet
      addMessage({
        role: 'user',
        content: `[Attached: ${file.name}]`,
      });
      
      // Optionally trigger agent response acknowledging the file
      setTimeout(() => {
        // This is just a simulation for the user experience
        sendMessage(`I have attached a file: ${file.name}`);
      }, 500);

    } catch (err) {
      Alert.alert('Upload Failed', 'Could not pick file');
    }
  }, [addMessage, sendMessage]);


  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
        // No offset needed if it wraps the whole screen
      >
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Vozia Agent</Text>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Online</Text>
            </View>
          </View>
        </View>

        <ScrollView
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="chatbubble-ellipses-outline" size={32} color={THEME.primary} />
              </View>
              <Text style={styles.emptyStateText}>
                How can I help you today?
              </Text>
              <Text style={styles.emptyStateHint}>
                Ask me anything or upload a document.
              </Text>
            </View>
          ) : (
            messages.map((message, index) => (
              <View
                key={message.id || index}
                style={[
                  styles.messageBubble,
                  message.role === 'user'
                    ? styles.userMessage
                    : styles.assistantMessage,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.role === 'user'
                      ? styles.userMessageText
                      : styles.assistantMessageText,
                  ]}
                >
                  {message.content}
                </Text>
              </View>
            ))
          )}
          
          {/* Streaming Message */}
          {isStreaming && streamingContent ? (
            <View style={[styles.messageBubble, styles.assistantMessage]}>
              <Text style={[styles.assistantMessageText, { color: '#000000' }]}>{streamingContent}</Text>
            </View>
          ) : null}

          {/* Thinking Indicator */}
          {(isLoading || isTyping) && !streamingContent && (
            <View style={[styles.messageBubble, styles.assistantMessage, styles.thinkingBubble]}>
              <ActivityIndicator size="small" color={THEME.textSecondary} />
              <Text style={styles.loadingText}>Thinking...</Text>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View style={[styles.inputWrapper, { paddingBottom: Math.max(insets.bottom, 10) }]}>
          <View style={styles.inputContainer}>
            {/* Attachment Button */}
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={handleAttachment}
              disabled={isLoading}
            >
              <Ionicons name="attach" size={24} color={THEME.textSecondary} />
            </TouchableOpacity>

            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder={isRecording ? "Listening..." : "Type a message..."}
              placeholderTextColor="#9CA3AF"
              multiline
              onSubmitEditing={handleSend}
              returnKeyType="send"
              editable={!isRecording}
            />

            {/* Voice Button */}
            <TouchableOpacity 
              style={[
                styles.iconButton, 
                isRecording && styles.recordingButton
              ]}
              onPress={handleVoiceToggle}
            >
              <Ionicons 
                name={isRecording ? "stop" : "mic"} 
                size={22} 
                color={isRecording ? THEME.error : THEME.textSecondary} 
              />
            </TouchableOpacity>

            {/* Send Button */}
            {inputText.trim().length > 0 && (
               <TouchableOpacity
                 style={styles.sendButton}
                 onPress={handleSend}
                 disabled={isLoading}
               >
                 <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
               </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
      
      <StatusBar style="dark" />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AgentProvider
        config={{
          apiKey: process.env.EXPO_PUBLIC_API_KEY as string,
          baseUrl: process.env.EXPO_PUBLIC_BASE_URL as string,
          agentId: process.env.EXPO_PUBLIC_AGENT_ID as string,
        }}
        features={{
          voice: true,
          tools: true,
          fileUpload: true,
        }}
        debug={true}
        theme={{}}
        isDark={false}
        onReady={() => console.log('[App] Agent ready')}
        onError={(error: any) => console.error('[App] Agent error:', error)}
      >
        <ChatScreen />
      </AgentProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    backgroundColor: THEME.surface,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 2,
    zIndex: 10,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.text,
    letterSpacing: -0.3,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5', // Green-50
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.success,
    marginRight: 4,
  },
  statusText: {
    fontSize: 11,
    color: '#047857', // Green-700
    fontWeight: '500',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E0E7FF', // Indigo-100
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    color: THEME.text,
    fontWeight: '600',
    marginBottom: 6,
  },
  emptyStateHint: {
    fontSize: 14,
    color: THEME.textSecondary,
    textAlign: 'center',
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 18,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 1,
    elevation: 1,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: THEME.primary,
    borderBottomRightRadius: 4,
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: THEME.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  thinkingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 8,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  assistantMessageText: {
    color: THEME.text,
  },
  loadingText: {
    color: THEME.textSecondary,
    fontSize: 13,
    fontStyle: 'italic',
  },
  inputWrapper: {
    backgroundColor: THEME.surface,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
    padding: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    paddingHorizontal: 8,
    paddingVertical: 6,
    minHeight: 48,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    maxHeight: 100,
    color: THEME.text,
  },
  iconButton: {
    padding: 8,
    marginHorizontal: 2,
    borderRadius: 20,
    minWidth: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingButton: {
    backgroundColor: '#FEE2E2', // Red-100
  },
  sendButton: {
    backgroundColor: THEME.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
    marginRight: 2,
  },
});
