import { useState, useCallback, useRef, useMemo } from 'react';
import { MonifyPaymentRef } from './MonifyPayment';

export interface UseMonifyPaymentConfig {
  /**
   * Callback function called when payment is successful
   */
  onSuccess?: (data?: any) => void;

  /**
   * Callback function called when payment fails
   */
  onFailure?: (error?: any) => void;

  /**
   * Callback function called when payment is cancelled by user
   */
  onCancel?: () => void;

  /**
   * Success URL patterns to match for successful payments
   */
  successUrlPatterns?: string[];

  /**
   * Failure URL patterns to match for failed payments
   */
  failureUrlPatterns?: string[];

  /**
   * Enable debug mode for logging
   */
  debug?: boolean;
}

export interface UseMonifyPaymentReturn {
  /**
   * Whether the payment modal is currently visible
   */
  isVisible: boolean;

  /**
   * Whether a payment is currently in progress
   */
  isLoading: boolean;

  /**
   * Current transaction URL
   */
  transactionUrl: string | null;

  /**
   * Error message if any
   */
  error: string | null;

  /**
   * Start a payment with the given transaction URL
   */
  startPayment: (url: string) => void;

  /**
   * Close the payment modal
   */
  closePayment: () => void;

  /**
   * Reload the current payment
   */
  reloadPayment: () => void;

  /**
   * Clear any errors
   */
  clearError: () => void;

  /**
   * Ref to the MonifyPayment component
   */
  paymentRef: React.RefObject<MonifyPaymentRef>;

  /**
   * Payment configuration
   */
  config: UseMonifyPaymentConfig;
}

export const useMonifyPayment = (
  initialConfig: UseMonifyPaymentConfig = {}
): UseMonifyPaymentReturn => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transactionUrl, setTransactionUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const paymentRef = useRef<MonifyPaymentRef>(null);

  const config: UseMonifyPaymentConfig = useMemo(
    () => ({
      debug: false,
      ...initialConfig,
    }),
    [initialConfig]
  );

  const startPayment = useCallback(
    (url: string) => {
      if (!url) {
        setError('Transaction URL is required');
        return;
      }

      setTransactionUrl(url);
      setIsVisible(true);
      setIsLoading(true);
      setError(null);

      if (config.debug) {
        console.log('[useMonifyPayment] Starting payment with URL:', url);
      }
    },
    [config.debug]
  );

  const closePayment = useCallback(() => {
    setIsVisible(false);
    setIsLoading(false);
    setTransactionUrl(null);
    setError(null);

    if (config.onCancel) {
      config.onCancel();
    }

    if (config.debug) {
      console.log('[useMonifyPayment] Payment closed');
    }
  }, [config]);

  const reloadPayment = useCallback(() => {
    if (paymentRef.current) {
      paymentRef.current.reload();
      setError(null);

      if (config.debug) {
        console.log('[useMonifyPayment] Payment reloaded');
      }
    }
  }, [config.debug]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleSuccess = useCallback(
    (data?: any) => {
      setIsLoading(false);
      setIsVisible(false);

      if (config.onSuccess) {
        config.onSuccess(data);
      }

      if (config.debug) {
        console.log('[useMonifyPayment] Payment successful:', data);
      }

      // Reset state after successful payment
      setTimeout(() => {
        setTransactionUrl(null);
      }, 500);
    },
    [config]
  );

  const handleFailure = useCallback(
    (err?: any) => {
      setIsLoading(false);
      setError(err?.error || 'Payment failed');

      if (config.onFailure) {
        config.onFailure(err);
      }

      if (config.debug) {
        console.log('[useMonifyPayment] Payment failed:', err);
      }
    },
    [config]
  );

  const handleCancel = useCallback(() => {
    closePayment();
  }, [closePayment]);

  return {
    isVisible,
    isLoading,
    transactionUrl,
    error,
    startPayment,
    closePayment,
    reloadPayment,
    clearError,
    paymentRef: paymentRef as React.RefObject<MonifyPaymentRef>,
    config: {
      ...config,
      onSuccess: handleSuccess,
      onFailure: handleFailure,
      onCancel: handleCancel,
    },
  };
};
