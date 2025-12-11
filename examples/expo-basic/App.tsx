// ============================================================================
// VOZIA AGENT SDK - BASIC EXAMPLE APP
// ============================================================================

import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  AgentProvider,
  AgentChat,
  AssistantButton,
  VoiceAssistantScreen,
  SupportScreen,
  useAgent,
} from '@vozia/agent';

// ----------------------------------------------------------------------------
// Configuration
// ----------------------------------------------------------------------------

// Replace with your actual credentials
const AGENT_CONFIG = {
  orgId: 'your-org-id',
  assistantId: 'your-assistant-id',
  apiKey: 'your-api-key',
  // Optionally specify a custom base URL
  // baseUrl: 'https://your-api.example.com',
};

// ----------------------------------------------------------------------------
// Main App
// ----------------------------------------------------------------------------

export default function App() {
  return (
    <AgentProvider
      config={AGENT_CONFIG}
      features={{
        voice: true,
        tools: true,
        support: true,
        persistence: true,
        haptics: true,
      }}
      theme={{
        primaryColor: '#6366F1',
        bubbleRadius: 16,
      }}
      debug={__DEV__}
    >
      <MainScreen />
      <StatusBar style="auto" />
    </AgentProvider>
  );
}

// ----------------------------------------------------------------------------
// Main Screen
// ----------------------------------------------------------------------------

type ScreenType = 'home' | 'chat' | 'voice' | 'support';

function MainScreen() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const { isConnected, error } = useAgent();

  // Render current screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'chat':
        return (
          <AgentChat
            showHeader={true}
            headerTitle="Chat Assistant"
            initialMessage="Hello! How can I help you today?"
            enableVoice={true}
            onClose={() => setCurrentScreen('home')}
          />
        );

      case 'voice':
        return (
          <VoiceAssistantScreen
            voiceConfig={{
              pushToTalk: true,
              voiceId: 'Puck',
            }}
            showTranscript={true}
            onSessionEnd={() => setCurrentScreen('home')}
          />
        );

      case 'support':
        return (
          <SupportScreen
            enableChat={true}
            enableTickets={true}
            title="Help & Support"
            onClose={() => setCurrentScreen('home')}
            onSubmitTicket={async (data) => {
              console.log('Ticket submitted:', data);
              // In a real app, you would send this to your backend
            }}
          />
        );

      default:
        return (
          <HomeScreen
            onNavigate={setCurrentScreen}
            isConnected={isConnected}
            error={error?.message}
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderScreen()}

      {/* Floating Assistant Button (only on home screen) */}
      {currentScreen === 'home' && (
        <AssistantButton
          position="bottom-right"
          size={56}
          hapticFeedback={true}
        />
      )}
    </SafeAreaView>
  );
}

// ----------------------------------------------------------------------------
// Home Screen
// ----------------------------------------------------------------------------

interface HomeScreenProps {
  onNavigate: (screen: ScreenType) => void;
  isConnected: boolean;
  error?: string;
}

function HomeScreen({ onNavigate, isConnected, error }: HomeScreenProps) {
  return (
    <View style={styles.homeContainer}>
      <Text style={styles.title}>Vozia Agent SDK</Text>
      <Text style={styles.subtitle}>Expo Example App</Text>

      {/* Connection status */}
      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: isConnected ? '#22C55E' : '#EF4444' },
          ]}
        />
        <Text style={styles.statusText}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </Text>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Navigation buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => onNavigate('chat')}
        >
          <Text style={styles.buttonText}>Open Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={() => onNavigate('voice')}
        >
          <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
            Voice Assistant
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonOutline]}
          onPress={() => onNavigate('support')}
        >
          <Text style={[styles.buttonText, styles.buttonTextOutline]}>
            Support
          </Text>
        </TouchableOpacity>
      </View>

      {/* Features info */}
      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>Features:</Text>
        <Text style={styles.featureItem}>✓ Real-time streaming chat</Text>
        <Text style={styles.featureItem}>✓ Voice input/output</Text>
        <Text style={styles.featureItem}>✓ Custom tools</Text>
        <Text style={styles.featureItem}>✓ Session persistence</Text>
        <Text style={styles.featureItem}>✓ Theming support</Text>
        <Text style={styles.featureItem}>✓ Offline queue</Text>
      </View>
    </View>
  );
}

// ----------------------------------------------------------------------------
// Styles
// ----------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  homeContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#6B7280',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#8B5CF6',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#6366F1',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    color: '#FFFFFF',
  },
  buttonTextOutline: {
    color: '#6366F1',
  },
  featuresContainer: {
    alignSelf: 'flex-start',
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  featureItem: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
});
