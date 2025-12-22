// ============================================================================
// VOZIA AGENT SDK - CUSTOMER SERVICE FAQ
// ============================================================================

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useTheme } from '../ThemeProvider';
import type { AgentTheme } from '../../types';
import type { CustomerServiceFAQProps, FAQItem, FAQSource } from './types';
import { DEFAULT_LABELS, SAMPLE_FAQS } from './constants';
import { CustomerServiceHeader } from './CustomerServiceHeader';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ----------------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------------

/**
 * FAQ screen with search and expandable items
 */
export function CustomerServiceFAQ({
  config,
  onBack,
  testID,
}: CustomerServiceFAQProps) {
  const theme = useTheme();
  const styles = createStyles(theme, config);
  const labels = { ...DEFAULT_LABELS, ...config.labels };

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load FAQs
  useEffect(() => {
    loadFAQs();
  }, [config.faqs]);

  const loadFAQs = useCallback(async () => {
    if (!config.faqs) {
      // Use sample FAQs if none provided
      setFaqs(SAMPLE_FAQS);
      return;
    }

    if (Array.isArray(config.faqs)) {
      setFaqs(config.faqs);
      return;
    }

    // FAQSource object
    const source = config.faqs as FAQSource;
    if (source.type === 'static') {
      setFaqs(source.data);
    } else if (source.type === 'api') {
      setIsLoading(true);
      try {
        const response = await fetch(source.endpoint, {
          headers: source.headers,
        });
        const data = await response.json();
        setFaqs(data);
      } catch (error) {
        console.error('Failed to fetch FAQs:', error);
        setFaqs(SAMPLE_FAQS);
      } finally {
        setIsLoading(false);
      }
    }
  }, [config.faqs]);

  // Filter FAQs based on search
  const filteredFAQs = faqs.filter((faq) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      faq.question.toLowerCase().includes(query) ||
      faq.answer.toLowerCase().includes(query) ||
      faq.tags?.some((tag) => tag.toLowerCase().includes(query)) ||
      faq.category?.toLowerCase().includes(query)
    );
  });

  // Group by category
  const groupedFAQs = filteredFAQs.reduce((acc, faq) => {
    const category = faq.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(faq);
    return acc;
  }, {} as Record<string, FAQItem[]>);

  const handleToggle = useCallback((id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((prev) => (prev === id ? null : id));

    // Callback for analytics
    const faq = faqs.find((f) => f.id === id);
    if (faq && config.onFAQView) {
      config.onFAQView(faq);
    }
  }, [faqs, config.onFAQView]);

  return (
    <View style={styles.container} testID={testID}>
      {/* Header */}
      <CustomerServiceHeader
        title={labels.faqTitle}
        logo={config.logo}
        showBackButton={true}
        showCloseButton={false}
        onBack={onBack}
        testID={`${testID}-header`}
      />

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <SearchIcon color={theme.textSecondaryColor} size={20} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={labels.faqSearchPlaceholder}
            placeholderTextColor={theme.textSecondaryColor}
            autoCapitalize="none"
            autoCorrect={false}
            testID={`${testID}-search`}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <ClearIcon color={theme.textSecondaryColor} size={18} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* FAQ List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {filteredFAQs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{labels.faqNoResults}</Text>
          </View>
        ) : (
          Object.entries(groupedFAQs).map(([category, items]) => (
            <View key={category} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>{category}</Text>
              {items.map((faq) => (
                <FAQItemCard
                  key={faq.id}
                  faq={faq}
                  isExpanded={expandedId === faq.id}
                  onToggle={() => handleToggle(faq.id)}
                  theme={theme}
                  config={config}
                  testID={`${testID}-faq-${faq.id}`}
                />
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

// ----------------------------------------------------------------------------
// FAQ Item Card
// ----------------------------------------------------------------------------

interface FAQItemCardProps {
  faq: FAQItem;
  isExpanded: boolean;
  onToggle: () => void;
  theme: AgentTheme;
  config: any;
  testID?: string;
}

function FAQItemCard({
  faq,
  isExpanded,
  onToggle,
  theme,
  config,
  testID,
}: FAQItemCardProps) {
  const styles = createItemStyles(theme, config);
  const rotateAnim = useRef(new Animated.Value(isExpanded ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: isExpanded ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isExpanded, rotateAnim]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={styles.itemContainer} testID={testID}>
      <TouchableOpacity
        style={styles.itemHeader}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <Text style={styles.itemQuestion}>{faq.question}</Text>
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <ChevronDownIcon color={theme.textSecondaryColor} size={20} />
        </Animated.View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.itemAnswer}>
          <Text style={styles.itemAnswerText}>{faq.answer}</Text>
        </View>
      )}
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

function SearchIcon({ color, size = 24 }: IconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: size * 0.55,
          height: size * 0.55,
          borderRadius: size * 0.275,
          borderWidth: 2,
          borderColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: size * 0.12,
          right: size * 0.12,
          width: size * 0.3,
          height: 2,
          backgroundColor: color,
          borderRadius: 1,
          transform: [{ rotate: '45deg' }],
        }}
      />
    </View>
  );
}

function ClearIcon({ color, size = 24 }: IconProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: `${color}20`,
        borderRadius: size / 2,
      }}
    >
      <View
        style={{
          position: 'absolute',
          width: size * 0.4,
          height: 2,
          backgroundColor: color,
          transform: [{ rotate: '45deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: size * 0.4,
          height: 2,
          backgroundColor: color,
          transform: [{ rotate: '-45deg' }],
        }}
      />
    </View>
  );
}

function ChevronDownIcon({ color, size = 24 }: IconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: size * 0.35,
          height: size * 0.35,
          borderRightWidth: 2,
          borderBottomWidth: 2,
          borderColor: color,
          transform: [{ rotate: '45deg' }],
          marginTop: -size * 0.1,
        }}
      />
    </View>
  );
}

// ----------------------------------------------------------------------------
// Styles
// ----------------------------------------------------------------------------

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

    searchContainer: {
      padding: 16,
      backgroundColor: customTheme.backgroundColor || theme.backgroundColor,
      // Removed borderBottom
    } as ViewStyle,

    searchInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surfaceColor,
      borderRadius: 12,
      paddingHorizontal: 12,
      height: 48, // Taller touch target
      // No border
    } as ViewStyle,

    searchInput: {
      flex: 1,
      marginLeft: 12,
      fontSize: 16,
      color: theme.textColor,
    } as TextStyle,

    scrollView: {
      flex: 1,
    } as ViewStyle,

    scrollContent: {
      paddingHorizontal: 16,
      paddingBottom: 40,
    } as ViewStyle,

    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
    } as ViewStyle,

    emptyText: {
      fontSize: 15,
      color: theme.textSecondaryColor,
      textAlign: 'center',
    } as TextStyle,

    categorySection: {
      marginBottom: 24,
    } as ViewStyle,

    categoryTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.textColor, // Stronger contrast
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 12,
      marginLeft: 4,
    } as TextStyle,
  });
}

function createItemStyles(theme: AgentTheme, config: any) {
  const customTheme = config.theme || {};

  return StyleSheet.create({
    itemContainer: {
      backgroundColor: customTheme.cardBackgroundColor || theme.surfaceColor,
      borderRadius: 12,
      marginBottom: 8,
      // Flat style: no border
    } as ViewStyle,

    itemHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
    } as ViewStyle,

    itemQuestion: {
      flex: 1,
      fontSize: 15,
      fontWeight: '500',
      color: customTheme.textColor || theme.textColor,
      marginRight: 12,
    } as TextStyle,

    itemAnswer: {
      paddingHorizontal: 16,
      paddingBottom: 16,
      // No top border, just whitespace
    } as ViewStyle,

    itemAnswerText: {
      fontSize: 15,
      color: customTheme.textSecondaryColor || theme.textSecondaryColor,
      lineHeight: 24,
    } as TextStyle,
  });
}
