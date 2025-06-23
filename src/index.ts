export { default as MonifyPayment } from './MonifyPayment';
export type { MonifyPaymentProps, MonifyPaymentRef } from './MonifyPayment';

export { useMonifyPayment } from './useMonifyPayment';
export type {
  UseMonifyPaymentConfig,
  UseMonifyPaymentReturn,
} from './useMonifyPayment';

// Utility functions
export const MonifyUtils = {
  /**
   * Validate if a URL is a valid Monify transaction URL
   */
  isValidTransactionUrl: (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'https:' && url.length > 0;
    } catch {
      return false;
    }
  },

  /**
   * Extract transaction reference from URL
   */
  extractTransactionRef: (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      return (
        urlObj.searchParams.get('reference') ||
        urlObj.searchParams.get('txRef') ||
        urlObj.searchParams.get('transactionRef') ||
        null
      );
    } catch {
      return null;
    }
  },

  /**
   * Check if URL indicates success
   */
  isSuccessUrl: (
    url: string,
    patterns: string[] = ['success', 'completed']
  ): boolean => {
    const lowercaseUrl = url.toLowerCase();
    return patterns.some(pattern =>
      lowercaseUrl.includes(pattern.toLowerCase())
    );
  },

  /**
   * Check if URL indicates failure
   */
  isFailureUrl: (
    url: string,
    patterns: string[] = ['failed', 'error', 'cancelled']
  ): boolean => {
    const lowercaseUrl = url.toLowerCase();
    return patterns.some(pattern =>
      lowercaseUrl.includes(pattern.toLowerCase())
    );
  },
};
