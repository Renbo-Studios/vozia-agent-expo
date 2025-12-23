// ============================================================================
// VOICE SDK EXAMPLE SCREEN
// Demonstrates all Voice SDK components with real voice functionality
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  VoiceAssistantScreen,
  PushToTalkButton,
  VoiceRecordButton,
  WaveformVisualizer,
  MicVisualizer,
  useVoice,
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

  // Use the actual voice hook from the SDK
  const {
    state: voiceState,
    isInitialized,
    isRecording,
    isProcessing,
    isPlaying,
    currentLevel,
    audioLevels,
    transcription,
    responseText,
    error,
    initialize,
    startRecording,
    stopRecording,
    reset,
  } = useVoice({
    config: {
      pushToTalk: true,
      voiceId: 'Puck',
    },
    onRecordingStart: () => {
      console.log('[VoiceSDKExample] Recording started');
    },
    onRecordingStop: (duration) => {
      console.log(`[VoiceSDKExample] Recording stopped, duration: ${duration}ms`);
    },
    onTranscription: (text, isFinal) => {
      console.log(`[VoiceSDKExample] Transcription: "${text}" (final: ${isFinal})`);
    },
    onResponseEnd: (text) => {
      console.log(`[VoiceSDKExample] AI Response: "${text}"`);
    },
    onError: (err) => {
      console.error('[VoiceSDKExample] Error:', err);
      Alert.alert('Voice Error', err.message || 'An error occurred');
    },
  });

  // Track if already initialized to prevent infinite loop
  const hasInitialized = useRef(false);

  // Initialize voice on mount (only once)
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    initialize().catch((err) => {
      console.error('[VoiceSDKExample] Failed to initialize:', err);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle push-to-talk button press
  const handlePTTStart = useCallback(async () => {
    setActiveDemo('ptt');
    try {
      await startRecording();
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  }, [startRecording]);

  const handlePTTStop = useCallback(async () => {
    try {
      await stopRecording();
    } catch (err) {
      console.error('Failed to stop recording:', err);
    }
    // Keep activeDemo until processing is complete
    if (!isProcessing) {
      setActiveDemo(null);
    }
  }, [stopRecording, isProcessing]);

  // Handle toggle recording button
  const handleToggleRecording = useCallback(async () => {
    if (activeDemo === 'record' && isRecording) {
      await stopRecording();
      setActiveDemo(null);
    } else {
      setActiveDemo('record');
      await startRecording();
    }
  }, [activeDemo, isRecording, startRecording, stopRecording]);

  // Handle waveform demo
  const handleWaveformDemo = useCallback(async () => {
    if (activeDemo === 'waveform') {
      await stopRecording();
      setActiveDemo(null);
    } else {
      setActiveDemo('waveform');
      await startRecording();
    }
  }, [activeDemo, startRecording, stopRecording]);

  // Handle mic visualizer demo
  const handleMicDemo = useCallback(async () => {
    if (activeDemo === 'mic') {
      await stopRecording();
      setActiveDemo(null);
    } else {
      setActiveDemo('mic');
      await startRecording();
    }
  }, [activeDemo, startRecording, stopRecording]);

  // Clear activeDemo when processing/playing is done
  useEffect(() => {
    if (!isRecording && !isProcessing && !isPlaying && activeDemo) {
      // Small delay to show the result
      const timeout = setTimeout(() => {
        if (activeDemo !== 'waveform' && activeDemo !== 'mic') {
          setActiveDemo(null);
        }
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [isRecording, isProcessing, isPlaying, activeDemo]);

  if (showFullScreen) {
    return (
      <VoiceAssistantScreen
        voiceConfig={{
          pushToTalk: true,
          voiceId: 'Puck',
        }}
        showTranscript={true}
        onSessionEnd={() => {
          reset();
          setShowFullScreen(false);
        }}
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
        {/* Status Banner */}
        {(transcription || responseText || error) && (
          <View style={styles.statusBanner}>
            {error && (
              <View style={styles.errorBanner}>
                <Ionicons name="warning-outline" size={16} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            {transcription && (
              <View style={styles.transcriptBanner}>
                <Text style={styles.transcriptLabel}>You said:</Text>
                <Text style={styles.transcriptText}>{transcription}</Text>
              </View>
            )}
            {responseText && (
              <View style={styles.responseBanner}>
                <Text style={styles.responseLabel}>AI Response:</Text>
                <Text style={styles.responseText}>{responseText}</Text>
              </View>
            )}
          </View>
        )}

        {/* Voice State Indicator */}
        <View style={styles.stateCard}>
          <View style={styles.stateRow}>
            <View style={[styles.stateIndicator, isInitialized && styles.stateActive]} />
            <Text style={styles.stateText}>
              {!isInitialized ? 'Initializing...' :
               isRecording ? 'Recording...' :
               isProcessing ? 'Processing...' :
               isPlaying ? 'Playing response...' :
               'Ready'}
            </Text>
          </View>
          <Text style={styles.stateSubtext}>
            Voice State: {voiceState} | Level: {(currentLevel * 100).toFixed(0)}%
          </Text>
        </View>

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
            disabled={!isInitialized}
          >
            <Text style={[styles.demoButtonText, !isInitialized && styles.disabledText]}>
              {isInitialized ? 'Open Full Screen' : 'Initializing...'}
            </Text>
            <Ionicons name="arrow-forward" size={18} color={isInitialized ? THEME.primary : THEME.textSecondary} />
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
              isProcessing={isProcessing && activeDemo === 'ptt'}
              audioLevel={currentLevel}
              pushToTalk={true}
              size="large"
              onRecordStart={handlePTTStart}
              onRecordStop={handlePTTStop}
              disabled={!isInitialized || (isRecording && activeDemo !== 'ptt')}
            />
            {activeDemo === 'ptt' && (isProcessing || isPlaying) && (
              <Text style={styles.demoLabel}>
                {isProcessing ? 'Processing...' : 'Playing response...'}
              </Text>
            )}
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
              onToggle={handleToggleRecording}
              size={64}
              disabled={!isInitialized || (isRecording && activeDemo !== 'record')}
            />
            <Text style={styles.demoLabel}>
              {isRecording && activeDemo === 'record' ? 'Recording... tap to stop' :
               isProcessing && activeDemo === 'record' ? 'Processing...' :
               'Tap to record'}
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
                currentLevel={currentLevel}
                isActive={activeDemo === 'waveform' && isRecording}
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
                currentLevel={activeDemo === 'waveform' ? currentLevel : 0.1}
                isActive={activeDemo === 'waveform' && isRecording}
                height={100}
                variant="circle"
                color={THEME.primary}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.demoButton,
              activeDemo === 'waveform' && isRecording && styles.demoButtonActive,
            ]}
            onPress={handleWaveformDemo}
            disabled={!isInitialized || (isRecording && activeDemo !== 'waveform')}
          >
            <Text
              style={[
                styles.demoButtonText,
                activeDemo === 'waveform' && isRecording && styles.demoButtonTextActive,
                !isInitialized && styles.disabledText,
              ]}
            >
              {activeDemo === 'waveform' && isRecording ? 'Stop Recording' :
               activeDemo === 'waveform' && isProcessing ? 'Processing...' :
               'Start Recording'}
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
              onPress={handleMicDemo}
              disabled={!isInitialized || (isRecording && activeDemo !== 'mic')}
            >
              <MicVisualizer
                level={activeDemo === 'mic' ? currentLevel : 0}
                isRecording={activeDemo === 'mic' && isRecording}
                color={THEME.primary}
                size={100}
              />
            </TouchableOpacity>
            <Text style={styles.demoLabel}>
              {activeDemo === 'mic' && isRecording ? 'Tap to stop' :
               activeDemo === 'mic' && isProcessing ? 'Processing...' :
               'Tap to record'}
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

  // Status Banner
  statusBanner: {
    backgroundColor: THEME.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    flex: 1,
  },
  transcriptBanner: {
    marginBottom: 8,
  },
  transcriptLabel: {
    fontSize: 12,
    color: THEME.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  transcriptText: {
    fontSize: 15,
    color: THEME.text,
    lineHeight: 22,
  },
  responseBanner: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },
  responseLabel: {
    fontSize: 12,
    color: THEME.primary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  responseText: {
    fontSize: 15,
    color: THEME.text,
    lineHeight: 22,
  },

  // State Card
  stateCard: {
    backgroundColor: THEME.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  stateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stateIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
  },
  stateActive: {
    backgroundColor: '#10B981',
  },
  stateText: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.text,
  },
  stateSubtext: {
    fontSize: 12,
    color: THEME.textSecondary,
    marginTop: 8,
  },

  // Disabled state
  disabledText: {
    color: THEME.textSecondary,
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
