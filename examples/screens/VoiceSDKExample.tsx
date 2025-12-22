// ============================================================================
// VOICE SDK EXAMPLE SCREEN
// Demonstrates all Voice SDK components
// ============================================================================

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  VoiceAssistantScreen,
  PushToTalkButton,
  VoiceRecordButton,
  WaveformVisualizer,
  MicVisualizer,
} from '@vozia/agent';

// ============================================================================
// TYPES
// ============================================================================

interface VoiceSDKExampleProps {
  onBack: () => void;
}

// ============================================================================
// THEME
// ============================================================================

const THEME = {
  primary: '#03B19D',
  secondary: '#00473F',
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

export function VoiceSDKExample({ onBack }: VoiceSDKExampleProps) {
  const insets = useSafeAreaInsets();
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  // Demo states
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  // Simulate audio level changes when recording
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setAudioLevel(Math.random() * 0.8 + 0.2);
      }, 100);
    } else {
      setAudioLevel(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Generate fake audio levels for visualizer demo
  const [audioLevels, setAudioLevels] = useState<Array<{ level: number; timestamp: number }>>([]);

  React.useEffect(() => {
    if (activeDemo === 'waveform') {
      const interval = setInterval(() => {
        setAudioLevels((prev) => {
          const newLevels = [...prev, { level: Math.random(), timestamp: Date.now() }];
          return newLevels.slice(-30);
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [activeDemo]);

  if (showFullScreen) {
    return (
      <VoiceAssistantScreen
        voiceConfig={{
          pushToTalk: true,
          voiceId: 'Puck',
        }}
        showTranscript={true}
        onSessionEnd={() => setShowFullScreen(false)}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={THEME.text} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.headerText}>Voice SDK</Text>
          <Text style={styles.headerSubtext}>Interactive Examples</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Full Screen Demo Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: THEME.primary }]}>
              <Ionicons name="expand-outline" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>Full Voice Assistant</Text>
              <Text style={styles.cardDescription}>
                Complete voice interface with waveform, transcript, and controls
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.demoButton}
            onPress={() => setShowFullScreen(true)}
          >
            <Text style={styles.demoButtonText}>Open Full Screen</Text>
            <Ionicons name="arrow-forward" size={18} color={THEME.primary} />
          </TouchableOpacity>
        </View>

        {/* Push to Talk Demo */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: '#6366F1' }]}>
              <Ionicons name="hand-left-outline" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>Push to Talk Button</Text>
              <Text style={styles.cardDescription}>
                Hold to record, release to send. Great for voice input.
              </Text>
            </View>
          </View>
          <View style={styles.demoArea}>
            <PushToTalkButton
              isRecording={isRecording && activeDemo === 'ptt'}
              isProcessing={false}
              audioLevel={audioLevel}
              pushToTalk={true}
              size="large"
              onRecordStart={() => {
                setActiveDemo('ptt');
                setIsRecording(true);
              }}
              onRecordStop={() => {
                setIsRecording(false);
                setActiveDemo(null);
              }}
            />
          </View>
        </View>

        {/* Voice Record Button Demo */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: '#F59E0B' }]}>
              <Ionicons name="mic-outline" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>Voice Record Button</Text>
              <Text style={styles.cardDescription}>
                Simple tap-to-toggle recording button
              </Text>
            </View>
          </View>
          <View style={styles.demoAreaRow}>
            <VoiceRecordButton
              isRecording={isRecording && activeDemo === 'record'}
              onToggle={() => {
                if (activeDemo === 'record' && isRecording) {
                  setIsRecording(false);
                  setActiveDemo(null);
                } else {
                  setActiveDemo('record');
                  setIsRecording(true);
                }
              }}
              size={64}
            />
            <Text style={styles.demoLabel}>
              {isRecording && activeDemo === 'record' ? 'Recording...' : 'Tap to record'}
            </Text>
          </View>
        </View>

        {/* Waveform Visualizer Demo */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: '#8B5CF6' }]}>
              <Ionicons name="pulse-outline" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>Waveform Visualizer</Text>
              <Text style={styles.cardDescription}>
                Real-time audio level visualization
              </Text>
            </View>
          </View>

          {/* Bar variant */}
          <View style={styles.visualizerDemo}>
            <Text style={styles.variantLabel}>Bars</Text>
            <View style={styles.visualizerContainer}>
              <WaveformVisualizer
                levels={audioLevels}
                currentLevel={audioLevel}
                isActive={activeDemo === 'waveform'}
                height={60}
                variant="bars"
                barCount={25}
                color={THEME.primary}
              />
            </View>
          </View>

          {/* Circle variant */}
          <View style={styles.visualizerDemo}>
            <Text style={styles.variantLabel}>Circle</Text>
            <View style={styles.visualizerContainer}>
              <WaveformVisualizer
                levels={audioLevels}
                currentLevel={activeDemo === 'waveform' ? audioLevel : 0.1}
                isActive={activeDemo === 'waveform'}
                height={100}
                variant="circle"
                color={THEME.primary}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.demoButton,
              activeDemo === 'waveform' && styles.demoButtonActive,
            ]}
            onPress={() => {
              if (activeDemo === 'waveform') {
                setActiveDemo(null);
                setIsRecording(false);
              } else {
                setActiveDemo('waveform');
                setIsRecording(true);
              }
            }}
          >
            <Text
              style={[
                styles.demoButtonText,
                activeDemo === 'waveform' && styles.demoButtonTextActive,
              ]}
            >
              {activeDemo === 'waveform' ? 'Stop Demo' : 'Start Demo'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Mic Visualizer Demo */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: '#EF4444' }]}>
              <Ionicons name="radio-outline" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>Mic Visualizer</Text>
              <Text style={styles.cardDescription}>
                Pulsing microphone with audio level feedback
              </Text>
            </View>
          </View>
          <View style={styles.demoArea}>
            <TouchableOpacity
              onPress={() => {
                if (activeDemo === 'mic') {
                  setActiveDemo(null);
                  setIsRecording(false);
                } else {
                  setActiveDemo('mic');
                  setIsRecording(true);
                }
              }}
            >
              <MicVisualizer
                level={activeDemo === 'mic' ? audioLevel : 0}
                isRecording={activeDemo === 'mic'}
                color={THEME.primary}
                size={100}
              />
            </TouchableOpacity>
            <Text style={styles.demoLabel}>
              {activeDemo === 'mic' ? 'Tap to stop' : 'Tap to demo'}
            </Text>
          </View>
        </View>

        {/* Code Example */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: '#10B981' }]}>
              <Ionicons name="code-slash-outline" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>Quick Integration</Text>
              <Text style={styles.cardDescription}>
                Add voice to your app with just a few lines
              </Text>
            </View>
          </View>
          <View style={styles.codeBlock}>
            <Text style={styles.codeText}>
              {`import { VoiceAssistantScreen } from '@vozia/agent';

<VoiceAssistantScreen
  voiceConfig={{
    pushToTalk: true,
    voiceId: 'Puck',
  }}
  showTranscript={true}
  onSessionEnd={() => goBack()}
/>`}
            </Text>
          </View>
        </View>

        <View style={{ height: insets.bottom + 20 }} />
      </ScrollView>
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

  // Demo areas
  demoArea: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  demoAreaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 16,
  },
  demoLabel: {
    fontSize: 14,
    color: THEME.textSecondary,
    marginTop: 12,
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
    marginTop: 8,
  },
  demoButtonActive: {
    backgroundColor: THEME.primary,
  },
  demoButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME.primary,
  },
  demoButtonTextActive: {
    color: '#FFFFFF',
  },

  // Visualizer
  visualizerDemo: {
    marginBottom: 16,
  },
  variantLabel: {
    fontSize: 12,
    color: THEME.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  visualizerContainer: {
    backgroundColor: THEME.surfaceLight,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
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
});

export default VoiceSDKExample;
