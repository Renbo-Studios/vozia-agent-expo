// ============================================================================
// VOZIA AGENT SDK - CUSTOMER SERVICE TYPES
// ============================================================================

import type { ImageSourcePropType } from 'react-native';
import type { AgentTheme, CreateTicketData, TicketPriority, ButtonPosition } from '../../types';

// ----------------------------------------------------------------------------
// FAQ Types
// ----------------------------------------------------------------------------

/**
 * FAQ item structure
 */
export interface FAQItem {
  /** Unique ID */
  id: string;
  /** Question text */
  question: string;
  /** Answer text (supports basic markdown) */
  answer: string;
  /** Category for grouping */
  category?: string;
  /** Tags for search */
  tags?: string[];
}

/**
 * FAQ category for grouping
 */
export interface FAQCategory {
  id: string;
  name: string;
  icon?: string;
}

/**
 * FAQ data source configuration
 */
export type FAQSource =
  | { type: 'static'; data: FAQItem[] }
  | { type: 'api'; endpoint: string; headers?: Record<string, string> };

// ----------------------------------------------------------------------------
// Customer Service Configuration
// ----------------------------------------------------------------------------

/**
 * Labels for i18n/customization
 */
export interface CustomerServiceLabels {
  // Header
  headerTitle: string;
  headerSubtitle: string;

  // Home screen
  welcomeMessage: string;
  quickActionsTitle: string;

  // Action cards
  chatTitle: string;
  chatDescription: string;
  faqTitle: string;
  faqDescription: string;
  ticketsTitle: string;
  ticketsDescription: string;
  callTitle: string;
  callDescription: string;

  // Chat
  chatPlaceholder: string;
  chatInitialMessage: string;

  // FAQ
  faqSearchPlaceholder: string;
  faqNoResults: string;
  faqCategories: string;

  // Tickets
  ticketFormTitle: string;
  ticketSubjectLabel: string;
  ticketSubjectPlaceholder: string;
  ticketDescriptionLabel: string;
  ticketDescriptionPlaceholder: string;
  ticketEmailLabel: string;
  ticketEmailPlaceholder: string;
  ticketNameLabel: string;
  ticketNamePlaceholder: string;
  ticketPriorityLabel: string;
  ticketSubmitButton: string;
  ticketSubmitting: string;
  ticketSuccessTitle: string;
  ticketSuccessMessage: string;
  ticketErrorTitle: string;
  ticketErrorMessage: string;
  myTicketsTitle: string;
  noTickets: string;

  // Call
  callPhoneTitle: string;
  callPhoneDescription: string;
  callVoiceTitle: string;
  callVoiceDescription: string;
  callScheduleTitle: string;

  // Common
  backButton: string;
  closeButton: string;
  poweredBy: string;
}

/**
 * Icon components/names for customization
 */
export interface CustomerServiceIcons {
  chat: React.ReactNode;
  faq: React.ReactNode;
  tickets: React.ReactNode;
  call: React.ReactNode;
  phone: React.ReactNode;
  voiceChat: React.ReactNode;
  back: React.ReactNode;
  close: React.ReactNode;
  search: React.ReactNode;
  send: React.ReactNode;
}

/**
 * Theme overrides specific to CustomerService
 */
export interface CustomerServiceTheme {
  // Override base theme colors
  primaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  surfaceColor?: string;
  textColor?: string;
  textSecondaryColor?: string;

  // Component-specific
  headerBackgroundColor?: string;
  cardBackgroundColor?: string;
  cardBorderColor?: string;

  // Typography
  fontFamily?: string;

  // Dimensions
  borderRadius?: number;
  cardBorderRadius?: number;
  buttonBorderRadius?: number;

  // Spacing
  contentPadding?: number;
}

/**
 * Main CustomerService configuration
 */
export interface CustomerServiceConfig {
  // ----- Branding -----
  /** Company logo (header) */
  logo?: ImageSourcePropType;
  /** Company name */
  companyName?: string;
  /** Welcome/greeting message */
  welcomeMessage?: string;

  // ----- Theme Overrides -----
  theme?: CustomerServiceTheme;

  // ----- Feature Toggles -----
  /** Enable chat section */
  enableChat?: boolean;
  /** Enable FAQ section */
  enableFAQ?: boolean;
  /** Enable tickets section */
  enableTickets?: boolean;
  /** Enable phone call option */
  enablePhoneCall?: boolean;
  /** Enable in-app voice chat */
  enableVoiceChat?: boolean;

  // ----- Content -----
  /** FAQ data (static array or API config) */
  faqs?: FAQItem[] | FAQSource;
  /** Phone number for calling */
  phoneNumber?: string;
  /** Support email */
  supportEmail?: string;

  // ----- Labels (i18n) -----
  labels?: Partial<CustomerServiceLabels>;

  // ----- Icons -----
  icons?: Partial<CustomerServiceIcons>;

  // ----- Callbacks -----
  /** Called when ticket is submitted - handle your own API logic */
  onTicketSubmit?: (ticket: CustomerServiceTicketData) => Promise<void>;
  /** Called when phone call is initiated */
  onPhoneCall?: (phoneNumber: string) => void;
  /** Called when voice chat starts */
  onVoiceChatStart?: () => void;
  /** Called when a FAQ item is viewed */
  onFAQView?: (faq: FAQItem) => void;
  /** Called when chat message is sent (for analytics) */
  onChatMessage?: (message: string) => void;
}

/**
 * Data passed to onTicketSubmit callback
 */
export interface CustomerServiceTicketData extends CreateTicketData {
  /** Additional custom fields */
  customFields?: Record<string, unknown>;
}

// ----------------------------------------------------------------------------
// Component Props
// ----------------------------------------------------------------------------

/**
 * CustomerServiceButton (FAB) props
 */
export interface CustomerServiceButtonProps {
  /** Configuration for the customer service panel */
  config?: CustomerServiceConfig;
  /** Button position on screen */
  position?: ButtonPosition;
  /** Button size in pixels */
  size?: number;
  /** Custom icon for the button */
  icon?: React.ReactNode;
  /** Enable haptic feedback */
  hapticFeedback?: boolean;
  /** Custom button background color */
  backgroundColor?: string;
  /** Badge count (e.g., unread messages) */
  badgeCount?: number;
  /** Show/hide the button */
  visible?: boolean;
  /** testID for testing */
  testID?: string;
}

/**
 * CustomerServiceSheet (bottom sheet) props
 */
export interface CustomerServiceSheetProps {
  /** Is the sheet visible */
  visible: boolean;
  /** Called when sheet should close */
  onClose: () => void;
  /** Configuration */
  config?: CustomerServiceConfig;
  /** Initial screen to show */
  initialScreen?: CustomerServiceScreen;
  /** testID for testing */
  testID?: string;
}

/**
 * Available screens in customer service
 */
export type CustomerServiceScreen = 'home' | 'chat' | 'faq' | 'tickets' | 'call';

/**
 * Navigation state for customer service
 */
export interface CustomerServiceNavigation {
  currentScreen: CustomerServiceScreen;
  history: CustomerServiceScreen[];
  canGoBack: boolean;
}

// ----------------------------------------------------------------------------
// Internal Component Props
// ----------------------------------------------------------------------------

export interface CustomerServiceHeaderProps {
  title: string;
  subtitle?: string;
  logo?: ImageSourcePropType;
  showBackButton?: boolean;
  showCloseButton?: boolean;
  onBack?: () => void;
  onClose?: () => void;
  testID?: string;
}

export interface CustomerServiceHomeProps {
  config: CustomerServiceConfig;
  onNavigate: (screen: CustomerServiceScreen) => void;
  testID?: string;
}

export interface CustomerServiceChatProps {
  config: CustomerServiceConfig;
  onBack: () => void;
  testID?: string;
}

export interface CustomerServiceFAQProps {
  config: CustomerServiceConfig;
  onBack: () => void;
  testID?: string;
}

export interface CustomerServiceTicketsProps {
  config: CustomerServiceConfig;
  onBack: () => void;
  testID?: string;
}

export interface CustomerServiceCallProps {
  config: CustomerServiceConfig;
  onBack: () => void;
  testID?: string;
}

// ----------------------------------------------------------------------------
// Hook Types
// ----------------------------------------------------------------------------

export interface UseCustomerServiceOptions {
  /** Initial configuration */
  config?: CustomerServiceConfig;
  /** Initial visibility state */
  initialVisible?: boolean;
}

export interface UseCustomerServiceReturn {
  /** Is the sheet visible */
  isVisible: boolean;
  /** Open the customer service sheet */
  open: (screen?: CustomerServiceScreen) => void;
  /** Close the sheet */
  close: () => void;
  /** Toggle visibility */
  toggle: () => void;
  /** Navigate to a specific screen */
  navigateTo: (screen: CustomerServiceScreen) => void;
  /** Current screen */
  currentScreen: CustomerServiceScreen;
  /** Current configuration */
  config: CustomerServiceConfig;
  /** Update configuration */
  updateConfig: (config: Partial<CustomerServiceConfig>) => void;
}
