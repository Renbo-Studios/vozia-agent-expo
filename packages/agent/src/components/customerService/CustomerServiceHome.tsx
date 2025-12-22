// ============================================================================
// VOZIA AGENT SDK - CUSTOMER SERVICE HOME
// ============================================================================

import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Image,
  TextInput,
  Platform,
  Dimensions,
} from 'react-native';
import { useTheme, withOpacity } from '../ThemeProvider';
import type { AgentTheme } from '../../types';
import type { CustomerServiceHomeProps, CustomerServiceConfig, FAQItem } from './types';
import { DEFAULT_LABELS } from './constants';

  const { width } = Dimensions.get('window');

  // ----------------------------------------------------------------------------
  // Component
  // ----------------------------------------------------------------------------

  export function CustomerServiceHome({
    config,
    onNavigate,
    onClose,
    testID,
  }: CustomerServiceHomeProps) {
    const theme = useTheme();
    const styles = createStyles(theme, config);
    const labels = { ...DEFAULT_LABELS, ...config.labels };

    // Parse FAQs for the preview list
    const previewFaqs: FAQItem[] = Array.isArray(config.faqs) 
      ? config.faqs.slice(0, 4) 
      : [];

    return (
      <View style={styles.container}>
        {/* Header Background */}
        <View style={styles.headerBackground}>
          {/* Header Content */}
          <View style={styles.headerTopRow}>
            {config.logo ? (
              <Image source={config.logo} style={styles.logo} resizeMode="contain" />
            ) : (
              <View style={styles.logoPlaceholder} />
            )}

            <View style={styles.headerRight}>
               {onClose && (
                  <TouchableOpacity onPress={onClose} style={styles.closeButton} hitSlop={{top:10, bottom:10, left:10, right:10}}>
                     <CloseIcon color={theme.isDark ? theme.textColor : '#FFF'} size={24} />
                  </TouchableOpacity>
               )}
            </View>
          </View>
          
          <View style={styles.greetingContainer}>
             <Text style={styles.greetingText}>
               {config.greeting || "Hi there 👋"}
             </Text>
             <Text style={styles.greetingSubtext}>
               {config.tagline || "How can we help?"}
             </Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          testID={testID}
        >
          {/* Main Action Cards */}
          <View style={styles.actionGrid}>
             {config.enableChat !== false && (
               <TouchableOpacity 
                  style={[styles.mainCard, styles.chatCard]} 
                  onPress={() => onNavigate('chat')}
                  activeOpacity={0.9}
               >
                  <View style={[styles.iconCircle]}>
                    <ChatBubbleIcon color={theme.textColor} size={20} />
                  </View>
                  <View style={styles.cardTextContainer}>
                    <Text style={styles.cardTitle}>{labels.chatTitle || "Messages"}</Text>
                    <Text style={styles.cardSubtitle}>Chat with us</Text>
                  </View>
                  <ChevronRightIcon color={withOpacity(theme.textColor, 0.3)} size={14} />
               </TouchableOpacity>
             )}

             {config.enableFAQ !== false && (
               <TouchableOpacity 
                  style={[styles.mainCard, styles.faqCard]} 
                  onPress={() => onNavigate('faq')}
                  activeOpacity={0.9}
               >
                  <View style={[styles.iconCircle]}>
                    <HelpCircleIcon color={theme.textColor} size={20} />
                  </View>
                  <View style={styles.cardTextContainer}>
                    <Text style={styles.cardTitle}>{labels.faqTitle || "Help Center"}</Text>
                    <Text style={styles.cardSubtitle}>Find answers</Text>
                  </View>
                  <ChevronRightIcon color={withOpacity(theme.textColor, 0.3)} size={14} />
               </TouchableOpacity>
             )}
          </View>

          {/* Send Message / Ticket Action */}
          {(config.enableTickets !== false) && (
            <TouchableOpacity 
              style={styles.ticketCard}
              onPress={() => onNavigate('tickets')}
              activeOpacity={0.9}
            >
              <View style={styles.ticketContent}>
                 <Text style={styles.sectionTitle}>Submit a Ticket</Text>
                 <Text style={styles.sectionSubtitle}>
                   We typically reply within a few hours
                 </Text>
              </View>
              <View style={styles.actionButton}>
                 <SendPlaneIcon color={theme.primaryColor} size={18} />
              </View>
            </TouchableOpacity>
          )}

          {/* Search / FAQ Section */}
          <View style={styles.sectionContainer}>
             <View style={styles.sectionHeader}>
               <Text style={styles.sectionTitle}>Common Questions</Text>
             </View>
             
             <View style={styles.listCard}>
               {previewFaqs.length > 0 ? (
                 <View>
                   {previewFaqs.map((faq, index) => (
                     <TouchableOpacity 
                       key={faq.id} 
                       style={[
                         styles.faqItem, 
                         index === previewFaqs.length - 1 && { borderBottomWidth: 0 }
                       ]}
                       onPress={() => onNavigate('faq')}
                     >
                       <Text style={styles.faqText} numberOfLines={2}>{faq.question}</Text>
                       <ChevronRightIcon color={withOpacity(theme.textColor, 0.3)} size={14} />
                     </TouchableOpacity>
                   ))}
                   <TouchableOpacity style={styles.viewAllButton} onPress={() => onNavigate('faq')}>
                      <Text style={styles.viewAllText}>View all articles</Text>
                   </TouchableOpacity>
                 </View>
               ) : (
                  <TouchableOpacity style={styles.faqPlaceholder} onPress={() => onNavigate('faq')}>
                     <Text style={styles.placeholderText}>Browse our help center</Text>
                     <ChevronRightIcon color={withOpacity(theme.textColor, 0.3)} size={14} />
                  </TouchableOpacity>
               )}
             </View>
          </View>

          {/* Status Footer */}
          <View style={styles.footer}>
             <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Systems Operational</Text>
             </View>
          </View>
          
          <View style={{height: 40}} /> 
        </ScrollView>
      </View>
    );
  }

  // ----------------------------------------------------------------------------
  // Icons
  // ----------------------------------------------------------------------------

  function CloseIcon({ color, size }: { color: string; size: number }) {
    return (
        <View style={{ width: size, height: size }}>
           <View style={{ 
              position: 'absolute', top: size/2 - 1, left: 0, right: 0, height: 2, 
              backgroundColor: color, transform: [{ rotate: '45deg' }] 
           }} />
           <View style={{ 
              position: 'absolute', top: size/2 - 1, left: 0, right: 0, height: 2, 
              backgroundColor: color, transform: [{ rotate: '-45deg' }] 
           }} />
        </View>
    );
  }

  function ChatBubbleIcon({ color, size }: { color: string; size: number }) {
    return (
      <View style={{ width: size, height: size, borderWidth: 2, borderColor: color, borderRadius: 6, borderBottomLeftRadius: 1 }}>
         <View style={{ position: 'absolute', top: size/3, left: size/4, right: size/4, height: 2, backgroundColor: color }} />
         <View style={{ position: 'absolute', top: size/1.8, left: size/4, right: size/3, height: 2, backgroundColor: color }} />
      </View>
    );
  }

  function HelpCircleIcon({ color, size }: { color: string; size: number }) {
    return (
      <View style={{ width: size, height: size, borderRadius: size/2, borderWidth: 2, borderColor: color, alignItems: 'center', justifyContent: 'center' }}>
         <Text style={{ color, fontWeight: '800', fontSize: size * 0.6 }}>?</Text>
      </View>
    );
  }

  function SendPlaneIcon({ color, size }: { color: string; size: number }) {
     return (
       <View style={{ width: size, height: size }}>
          <View style={{ 
             width: 0, height: 0, 
             borderTopWidth: size/2, borderBottomWidth: size/2, borderLeftWidth: size, 
             borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: color 
          }} />
       </View>
     );
  }

  function ChevronRightIcon({ color, size }: { color: string; size: number }) {
    return (
      <View style={{ width: size/2, height: size/2, borderTopWidth: 2, borderRightWidth: 2, borderColor: color, transform: [{ rotate: '45deg' }] }} />
    );
  }

  // ----------------------------------------------------------------------------
  // Styles
  // ----------------------------------------------------------------------------

  function createStyles(theme: AgentTheme, config: CustomerServiceConfig) {
    const isDark = theme.isDark;
    
    return StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: theme.backgroundColor,
      } as ViewStyle,

      headerBackground: {
         backgroundColor: theme.backgroundColor,
         paddingTop: Platform.OS === 'ios' ? 60 : 40,
         paddingHorizontal: 24,
         paddingBottom: 24,
      } as ViewStyle,

      headerTopRow: {
         flexDirection: 'row',
         justifyContent: 'space-between',
         alignItems: 'center',
         marginBottom: 24,
      } as ViewStyle,

      logo: {
         width: 28,
         height: 28,
         tintColor: theme.textColor
      },
      logoPlaceholder: {
         width: 28, 
         height: 28, 
         backgroundColor: withOpacity(theme.textColor, 0.1),
         borderRadius: 6,
      },

      headerRight: {
         flexDirection: 'row',
         alignItems: 'center',
      },

      closeButton: {
         padding: 8,
         backgroundColor: withOpacity(theme.textColor, 0.05),
         borderRadius: 16,
      },

      greetingContainer: {
         marginBottom: 8,
      },
      greetingText: {
         fontSize: 28,
         fontWeight: '700',
         color: theme.textColor,
         marginBottom: 4,
         letterSpacing: -0.5,
      } as TextStyle,
      greetingSubtext: {
         fontSize: 16,
         fontWeight: '500',
         color: theme.textSecondaryColor,
      } as TextStyle,

      scrollView: {
        flex: 1,
      },
      content: {
         paddingHorizontal: 20,
         paddingBottom: 40,
      } as ViewStyle,

      actionGrid: {
        marginBottom: 20,
      },
      mainCard: {
         backgroundColor: theme.surfaceColor,
         borderRadius: 16,
         padding: 16,
         marginBottom: 12,
         flexDirection: 'row',
         alignItems: 'center',
      } as ViewStyle, // Flat, no shadow, no border
      
      chatCard: {},
      faqCard: {},

      iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        // No background color, just simple
      },
      cardTextContainer: {
        flex: 1,
      },
      cardTitle: {
         fontSize: 16,
         fontWeight: '600',
         color: theme.textColor,
         marginBottom: 2,
      },
      cardSubtitle: {
         fontSize: 14,
         color: theme.textSecondaryColor,
      },

      ticketCard: {
         backgroundColor: theme.surfaceColor,
         borderRadius: 16,
         padding: 20,
         marginBottom: 24,
         flexDirection: 'row',
         alignItems: 'center',
         justifyContent: 'space-between',
      } as ViewStyle,
      ticketContent: {
        flex: 1,
      },
      actionButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: withOpacity(theme.primaryColor, 0.1),
        marginLeft: 16,
      },

      sectionContainer: {
        marginBottom: 24,
      },
      sectionHeader: {
        marginBottom: 12,
        paddingHorizontal: 4,
      },
      sectionTitle: {
         fontSize: 16,
         fontWeight: '600',
         color: theme.textColor,
      },
      sectionSubtitle: {
         fontSize: 14,
         color: theme.textSecondaryColor,
         marginTop: 4,
      },

      listCard: {
         backgroundColor: theme.surfaceColor,
         borderRadius: 16,
         overflow: 'hidden',
      } as ViewStyle,
      faqItem: {
         padding: 16,
         flexDirection: 'row',
         alignItems: 'center',
         justifyContent: 'space-between',
         // No visible border separators preferred for ultra clean look, or very subtle
         borderBottomWidth: 0.5,
         borderBottomColor: withOpacity(theme.borderColor, 0.5),
      },
      faqText: {
         flex: 1,
         fontSize: 14,
         fontWeight: '500',
         color: theme.textColor,
         marginRight: 16,
         lineHeight: 20,
      },
      viewAllButton: {
         padding: 14,
         alignItems: 'center',
      },
      viewAllText: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.textColor,
        opacity: 0.7,
      },
      faqPlaceholder: {
         padding: 24,
         alignItems: 'center',
         justifyContent: 'center',
         flexDirection: 'row',
         gap: 8,
      },
      placeholderText: {
         fontSize: 14,
         color: theme.textSecondaryColor,
         fontWeight: '500',
      },

      footer: {
         alignItems: 'center',
         paddingTop: 8,
      },
      statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.surfaceColor,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 100,
      },
      statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#10B981',
        marginRight: 8,
      },
      statusText: {
        fontSize: 11,
        fontWeight: '500',
        color: theme.textSecondaryColor,
      },
    });
  }

