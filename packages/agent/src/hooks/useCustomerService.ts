// ============================================================================
// VOZIA AGENT SDK - USE CUSTOMER SERVICE HOOK
// ============================================================================

// Re-export the context hook as the main useCustomerService hook
export { useCustomerServiceContext as useCustomerService } from '../components/customerService/CustomerServiceContext';

// Re-export types
export type {
  UseCustomerServiceOptions,
  UseCustomerServiceReturn,
  CustomerServiceConfig,
  CustomerServiceScreen,
} from '../components/customerService/types';
