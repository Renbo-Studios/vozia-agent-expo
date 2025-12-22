// ============================================================================
// VOZIA AGENT SDK - CUSTOMER SERVICE CONSTANTS
// ============================================================================

import type { CustomerServiceLabels, CustomerServiceConfig, CustomerServiceTheme } from './types';

// ----------------------------------------------------------------------------
// Default Labels
// ----------------------------------------------------------------------------

export const DEFAULT_LABELS: CustomerServiceLabels = {
  // Header
  headerTitle: 'Help Center',
  headerSubtitle: "We're here to help",

  // Home screen
  welcomeMessage: 'How can we help you today?',
  quickActionsTitle: 'Quick Actions',

  // Action cards
  chatTitle: 'Chat with us',
  chatDescription: 'Get instant help from our AI assistant',
  faqTitle: 'FAQs',
  faqDescription: 'Find answers to common questions',
  ticketsTitle: 'Submit a ticket',
  ticketsDescription: 'Create a support request',
  callTitle: 'Call us',
  callDescription: 'Speak with our support team',

  // Chat
  chatPlaceholder: 'Type your message...',
  chatInitialMessage: 'Hello! How can I help you today?',

  // FAQ
  faqSearchPlaceholder: 'Search for help...',
  faqNoResults: 'No results found. Try a different search term.',
  faqCategories: 'Categories',

  // Tickets
  ticketFormTitle: 'Submit a Support Request',
  ticketSubjectLabel: 'Subject',
  ticketSubjectPlaceholder: 'Brief description of your issue',
  ticketDescriptionLabel: 'Description',
  ticketDescriptionPlaceholder: 'Please describe your issue in detail...',
  ticketEmailLabel: 'Email',
  ticketEmailPlaceholder: 'your@email.com',
  ticketNameLabel: 'Name',
  ticketNamePlaceholder: 'Your name',
  ticketPriorityLabel: 'Priority',
  ticketSubmitButton: 'Submit Ticket',
  ticketSubmitting: 'Submitting...',
  ticketSuccessTitle: 'Ticket Submitted',
  ticketSuccessMessage: 'We\'ll get back to you as soon as possible.',
  ticketErrorTitle: 'Error',
  ticketErrorMessage: 'Failed to submit ticket. Please try again.',
  myTicketsTitle: 'My Tickets',
  noTickets: 'No tickets yet',

  // Call
  callPhoneTitle: 'Call Support',
  callPhoneDescription: 'Speak directly with our team',
  callVoiceTitle: 'Voice Chat',
  callVoiceDescription: 'Start an in-app voice conversation',
  callScheduleTitle: 'Schedule a Call',

  // Common
  backButton: 'Back',
  closeButton: 'Close',
  poweredBy: 'Powered by Vozia',
};

// ----------------------------------------------------------------------------
// Default Theme Overrides
// ----------------------------------------------------------------------------

export const DEFAULT_CUSTOMER_SERVICE_THEME: CustomerServiceTheme = {
  // These are undefined by default to inherit from AgentTheme
  primaryColor: undefined,
  accentColor: undefined,
  backgroundColor: undefined,
  surfaceColor: undefined,
  textColor: undefined,
  textSecondaryColor: undefined,
  headerBackgroundColor: undefined,
  cardBackgroundColor: undefined,
  cardBorderColor: undefined,
  fontFamily: undefined,
  borderRadius: 16,
  cardBorderRadius: 16,
  buttonBorderRadius: 12,
  contentPadding: 16,
};

// ----------------------------------------------------------------------------
// Default Configuration
// ----------------------------------------------------------------------------

export const DEFAULT_CONFIG: Required<Omit<CustomerServiceConfig,
  'logo' | 'faqs' | 'phoneNumber' | 'supportEmail' |
  'onTicketSubmit' | 'onPhoneCall' | 'onVoiceChatStart' |
  'onFAQView' | 'onChatMessage' | 'icons'
>> & Pick<CustomerServiceConfig,
  'logo' | 'faqs' | 'phoneNumber' | 'supportEmail' |
  'onTicketSubmit' | 'onPhoneCall' | 'onVoiceChatStart' |
  'onFAQView' | 'onChatMessage' | 'icons'
> = {
  // Branding
  logo: undefined,
  companyName: 'Support',
  welcomeMessage: DEFAULT_LABELS.welcomeMessage,

  // Theme
  theme: DEFAULT_CUSTOMER_SERVICE_THEME,

  // Features
  enableChat: true,
  enableFAQ: true,
  enableTickets: true,
  enablePhoneCall: false,
  enableVoiceChat: false,

  // Content
  faqs: undefined,
  phoneNumber: undefined,
  supportEmail: undefined,

  // Labels
  labels: DEFAULT_LABELS,

  // Icons (undefined = use defaults)
  icons: undefined,

  // Callbacks
  onTicketSubmit: undefined,
  onPhoneCall: undefined,
  onVoiceChatStart: undefined,
  onFAQView: undefined,
  onChatMessage: undefined,
};

// ----------------------------------------------------------------------------
// Animation Configuration
// ----------------------------------------------------------------------------

export const ANIMATION_CONFIG = {
  /** Spring animation for sheet open/close */
  sheet: {
    damping: 20,
    stiffness: 300,
    mass: 0.8,
  },

  /** Duration for fade animations (ms) */
  fade: {
    duration: 200,
  },

  /** Card press animation */
  cardPress: {
    scale: 0.98,
    duration: 100,
  },

  /** Haptic feedback patterns */
  haptics: {
    buttonPress: 'impactLight' as const,
    success: 'notificationSuccess' as const,
    error: 'notificationError' as const,
    warning: 'notificationWarning' as const,
  },
} as const;

// ----------------------------------------------------------------------------
// Layout Constants
// ----------------------------------------------------------------------------

export const LAYOUT = {
  /** Sheet height as percentage of screen */
  sheetHeight: 0.85,
  /** Sheet handle dimensions */
  handleWidth: 40,
  handleHeight: 4,
  /** Header height */
  headerHeight: 60,
  /** FAB size */
  fabSize: 56,
  /** Action card dimensions */
  cardMinHeight: 80,
  cardIconSize: 32,
  /** Animation durations */
  backdropDuration: 200,
} as const;

// ----------------------------------------------------------------------------
// Z-Index Layers
// ----------------------------------------------------------------------------

export const Z_INDEX = {
  backdrop: 1000,
  sheet: 1001,
  header: 1002,
  fab: 999,
} as const;

// ----------------------------------------------------------------------------
// Sample FAQs (for demo/testing)
// ----------------------------------------------------------------------------

export const SAMPLE_FAQS = [
  {
    id: '1',
    question: 'How do I reset my password?',
    answer: 'To reset your password, go to Settings > Account > Change Password. You\'ll receive an email with instructions to create a new password.',
    category: 'Account',
    tags: ['password', 'reset', 'account', 'security'],
  },
  {
    id: '2',
    question: 'How can I contact customer support?',
    answer: 'You can reach our support team through this help center chat, by submitting a ticket, or by calling our support line during business hours.',
    category: 'Support',
    tags: ['contact', 'support', 'help'],
  },
  {
    id: '3',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and Apple Pay.',
    category: 'Billing',
    tags: ['payment', 'billing', 'credit card', 'paypal'],
  },
  {
    id: '4',
    question: 'How do I cancel my subscription?',
    answer: 'To cancel your subscription, go to Settings > Subscription > Cancel Subscription. Your access will continue until the end of your current billing period.',
    category: 'Billing',
    tags: ['cancel', 'subscription', 'billing'],
  },
  {
    id: '5',
    question: 'Is my data secure?',
    answer: 'Yes, we use industry-standard encryption (AES-256) to protect your data. All communications are secured with TLS 1.3, and we never share your personal information with third parties.',
    category: 'Security',
    tags: ['security', 'privacy', 'data', 'encryption'],
  },
];
