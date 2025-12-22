// ============================================================================
// VOZIA AGENT SDK - CUSTOMER SERVICE INDEX
// ============================================================================

// Main components
export { CustomerServiceButton, CustomerServiceProvider } from './CustomerServiceButton';
export { CustomerServiceSheet } from './CustomerServiceSheet';
export { CustomerServiceContextProvider, useCustomerServiceContext } from './CustomerServiceContext';

// Screen components (for advanced customization)
export { CustomerServiceHome } from './CustomerServiceHome';
export { CustomerServiceChat } from './CustomerServiceChat';
export { CustomerServiceFAQ } from './CustomerServiceFAQ';
export { CustomerServiceTickets } from './CustomerServiceTickets';
export { CustomerServiceCall } from './CustomerServiceCall';
export { CustomerServiceHeader } from './CustomerServiceHeader';

// Types
export type {
  // Main config types
  CustomerServiceConfig,
  CustomerServiceButtonProps,
  CustomerServiceSheetProps,
  CustomerServiceScreen,
  CustomerServiceNavigation,
  CustomerServiceTicketData,

  // Customization types
  CustomerServiceLabels,
  CustomerServiceIcons,
  CustomerServiceTheme,

  // FAQ types
  FAQItem,
  FAQCategory,
  FAQSource,

  // Hook types
  UseCustomerServiceOptions,
  UseCustomerServiceReturn,

  // Internal component props (for advanced usage)
  CustomerServiceHeaderProps,
  CustomerServiceHomeProps,
  CustomerServiceChatProps,
  CustomerServiceFAQProps,
  CustomerServiceTicketsProps,
  CustomerServiceCallProps,
} from './types';

// Constants (for advanced usage)
export {
  DEFAULT_LABELS,
  DEFAULT_CONFIG,
  DEFAULT_CUSTOMER_SERVICE_THEME,
  ANIMATION_CONFIG,
  LAYOUT,
  SAMPLE_FAQS,
} from './constants';
