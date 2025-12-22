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

function createStyles(theme: AgentTheme, config: any) {
  const customTheme = config.theme || {};

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: customTheme.backgroundColor || theme.backgroundColor,
    } as ViewStyle,

    searchContainer: {
      padding: theme.spacingMd,
      backgroundColor: customTheme.backgroundColor || theme.backgroundColor,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderColor,
    } as ViewStyle,

    searchInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surfaceColor,
      borderRadius: theme.inputRadius,
      paddingHorizontal: theme.spacingMd,
      height: 44,
      borderWidth: 1,
      borderColor: theme.borderColor,
    } as ViewStyle,

    searchInput: {
      flex: 1,
      marginLeft: theme.spacingSm,
      fontSize: theme.fontSizeMedium,
      color: theme.textColor,
    } as TextStyle,

    scrollView: {
      flex: 1,
    } as ViewStyle,

    scrollContent: {
      padding: theme.spacingMd,
    } as ViewStyle,

    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacingXl * 2,
    } as ViewStyle,

    emptyText: {
      fontSize: theme.fontSizeMedium,
      color: theme.textSecondaryColor,
      textAlign: 'center',
    } as TextStyle,

    categorySection: {
      marginBottom: theme.spacingLg,
    } as ViewStyle,

    categoryTitle: {
      fontSize: theme.fontSizeSmall,
      fontWeight: '600',
      color: theme.textSecondaryColor,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: theme.spacingSm,
    } as TextStyle,
  });
}

function createItemStyles(theme: AgentTheme, config: any) {
  const customTheme = config.theme || {};

  return StyleSheet.create({
    itemContainer: {
      backgroundColor: customTheme.cardBackgroundColor || theme.surfaceColor,
      borderRadius: theme.cardRadius,
      marginBottom: theme.spacingSm,
      borderWidth: 1,
      borderColor: customTheme.cardBorderColor || theme.borderColor,
      overflow: 'hidden',
    } as ViewStyle,

    itemHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacingMd,
    } as ViewStyle,

    itemQuestion: {
      flex: 1,
      fontSize: theme.fontSizeMedium,
      fontWeight: '500',
      color: customTheme.textColor || theme.textColor,
      marginRight: theme.spacingSm,
    } as TextStyle,

    itemAnswer: {
      paddingHorizontal: theme.spacingMd,
      paddingBottom: theme.spacingMd,
      borderTopWidth: 1,
      borderTopColor: theme.borderColor,
      backgroundColor: theme.backgroundColor,
    } as ViewStyle,

    itemAnswerText: {
      fontSize: theme.fontSizeMedium,
      color: customTheme.textSecondaryColor || theme.textSecondaryColor,
      lineHeight: theme.fontSizeMedium * 1.6,
      paddingTop: theme.spacingMd,
    } as TextStyle,
  });
}
