// ============================================================================
// EXAMPLES HOME SCREEN
// Main hub showing all SDK examples
// ============================================================================

import React from 'react';
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

// ============================================================================
// TYPES
// ============================================================================

export type ExampleScreen =
  | 'home'
  | 'voice-sdk'
  | 'chat-sdk'
  | 'customer-service'
  | 'ecommerce-demo';

interface ExamplesHomeProps {
  onNavigate: (screen: ExampleScreen) => void;
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
// EXAMPLES DATA
// ============================================================================

interface ExampleItem {
  id: ExampleScreen;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: string[];
  features: string[];
  status: 'live' | 'coming-soon';
  isNew?: boolean;
}

const EXAMPLES: ExampleItem[] = [
  {
    id: 'voice-sdk',
    title: 'Voice SDK',
    description: 'Real-time voice calling with AI. Includes push-to-talk, waveform visualizers, and mute controls.',
    icon: 'call-outline',
    gradient: ['#03B19D', '#00473F'],
    features: ['Push to Talk', 'Waveform Visualizer', 'Mute Controls', 'AI Voice'],
    status: 'live',
    isNew: true,
  },
  {
    id: 'chat-sdk',
    title: 'Chat SDK',
    description: 'AI-powered chat interface with streaming responses, file uploads, and markdown support.',
    icon: 'chatbubbles-outline',
    gradient: ['#6366F1', '#4F46E5'],
    features: ['Streaming Messages', 'File Attachments', 'Markdown', 'Typing Indicator'],
    status: 'live',
  },
  {
    id: 'customer-service',
    title: 'Customer Service',
    description: 'Complete support widget with chat, FAQ, tickets, and phone support.',
    icon: 'headset-outline',
    gradient: ['#F59E0B', '#D97706'],
    features: ['AI Chat', 'FAQ Browser', 'Ticket System', 'Phone Support'],
    status: 'live',
  },
  {
    id: 'ecommerce-demo',
    title: 'E-Commerce Demo',
    description: 'Full demo app showing SDK integration in an e-commerce context.',
    icon: 'cart-outline',
    gradient: ['#8B5CF6', '#7C3AED'],
    features: ['Product Listing', 'Support FAB', 'Help Button', 'Cart Integration'],
    status: 'live',
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

export function ExamplesHome({ onNavigate }: ExamplesHomeProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Ionicons name="cube" size={24} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.logoText}>Vozia SDK</Text>
            <Text style={styles.logoSubtext}>Examples & Demos</Text>
          </View>
        </View>
      </View>

      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>SDK Examples</Text>
        <Text style={styles.heroDescription}>
          Explore interactive demos and see how to integrate Vozia SDK into your app.
        </Text>
      </View>

      {/* Examples Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {EXAMPLES.map((example) => (
            <ExampleCard
              key={example.id}
              example={example}
              onPress={() => onNavigate(example.id)}
            />
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Built with Vozia Agent SDK
          </Text>
          <Text style={styles.footerVersion}>v2.0.0</Text>
        </View>

        <View style={{ height: insets.bottom + 20 }} />
      </ScrollView>
    </View>
  );
}

// ============================================================================
// EXAMPLE CARD
// ============================================================================

interface ExampleCardProps {
  example: ExampleItem;
  onPress: () => void;
}

function ExampleCard({ example, onPress }: ExampleCardProps) {
  const isDisabled = example.status === 'coming-soon';

  return (
    <TouchableOpacity
      style={[styles.card, isDisabled && styles.cardDisabled]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={isDisabled}
    >
      {/* Icon */}
      <View
        style={[
          styles.cardIcon,
          { backgroundColor: example.gradient[0] },
        ]}
      >
        <Ionicons name={example.icon} size={28} color="#FFFFFF" />
      </View>

      {/* Badges */}
      <View style={styles.cardBadges}>
        {example.isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
        )}
        <View
          style={[
            styles.statusBadge,
            example.status === 'live' ? styles.statusLive : styles.statusSoon,
          ]}
        >
          <Text style={styles.statusText}>
            {example.status === 'live' ? 'Live' : 'Soon'}
          </Text>
        </View>
      </View>

      {/* Content */}
      <Text style={styles.cardTitle}>{example.title}</Text>
      <Text style={styles.cardDescription} numberOfLines={2}>
        {example.description}
      </Text>

      {/* Features */}
      <View style={styles.cardFeatures}>
        {example.features.slice(0, 3).map((feature, index) => (
          <View key={index} style={styles.featureTag}>
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
        {example.features.length > 3 && (
          <View style={styles.featureTag}>
            <Text style={styles.featureText}>+{example.features.length - 3}</Text>
          </View>
        )}
      </View>

      {/* Arrow */}
      <View style={styles.cardArrow}>
        <Ionicons name="arrow-forward" size={20} color={THEME.primary} />
      </View>
    </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: THEME.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.text,
    letterSpacing: -0.5,
  },
  logoSubtext: {
    fontSize: 13,
    color: THEME.textSecondary,
    marginTop: -2,
  },

  // Hero
  hero: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: THEME.text,
    marginBottom: 8,
    letterSpacing: -1,
  },
  heroDescription: {
    fontSize: 16,
    color: THEME.textSecondary,
    lineHeight: 24,
  },

  // Grid
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  grid: {
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
  cardDisabled: {
    opacity: 0.5,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardBadges: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    gap: 8,
  },
  newBadge: {
    backgroundColor: THEME.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusLive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  statusSoon: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: THEME.textSecondary,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.text,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: THEME.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  cardFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureTag: {
    backgroundColor: THEME.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  featureText: {
    fontSize: 12,
    color: THEME.textSecondary,
  },
  cardArrow: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 13,
    color: THEME.textSecondary,
  },
  footerVersion: {
    fontSize: 12,
    color: THEME.textSecondary,
    opacity: 0.5,
    marginTop: 4,
  },
});

export default ExamplesHome;
