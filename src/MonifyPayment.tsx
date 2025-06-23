import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Text,
} from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';

export interface MonifyPaymentProps {
  /**
   * The transaction URL from Monify
   */
  transactionUrl: string;

  /**
   * Callback function called when payment is successful
   */
  onSuccess: (data?: any) => void;

  /**
   * Callback function called when payment fails
   */
  onFailure: (error?: any) => void;

  /**
   * Callback function called when payment is cancelled by user
   */
  onCancel?: () => void;

  /**
   * Whether the payment modal is visible
   */
  visible: boolean;

  /**
   * Custom loading component
   */
  LoadingComponent?: React.ComponentType;

  /**
   * Custom styles for the modal
   */
  modalStyle?: object;

  /**
   * Custom styles for the container
   */
  containerStyle?: object;

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

export interface MonifyPaymentRef {
  /**
   * Close the payment modal
   */
  close: () => void;

  /**
   * Reload the WebView
   */
  reload: () => void;
}

const MonifyPayment = React.forwardRef<MonifyPaymentRef, MonifyPaymentProps>(
  (
    {
      transactionUrl,
      onSuccess,
      onFailure,
      onCancel,
      visible,
      LoadingComponent,
      modalStyle,
      containerStyle,
      successUrlPatterns = [
        'success',
        'completed',
        'approved',
        'transaction-successful',
      ],
      failureUrlPatterns = [
        'failed',
        'error',
        'cancelled',
        'declined',
        'transaction-failed',
      ],
      debug = false,
    },
    ref
  ) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const webViewRef = useRef<WebView>(null);

    // Reset error state when transactionUrl or visible changes
    useEffect(() => {
      setError(null);
    }, [transactionUrl, visible]);

    const log = useCallback(
      (message: string, data?: any) => {
        if (debug) {
          console.log(`[MonifyPayment] ${message}`, data);
        }
      },
      [debug]
    );

    const handleClose = useCallback(() => {
      setLoading(true);
      setError(null);
      if (onCancel) {
        onCancel();
      }
    }, [onCancel]);

    const handleReload = useCallback(() => {
      if (webViewRef.current) {
        webViewRef.current.reload();
        setError(null);
        setLoading(true);
      }
    }, []);

    React.useImperativeHandle(ref, () => ({
      close: handleClose,
      reload: handleReload,
    }));

    const extractDataFromUrl = useCallback(
      (url: string) => {
        try {
          const urlObj = new URL(url);
          const params: { [key: string]: string } = {};

          urlObj.searchParams.forEach((value, key) => {
            params[key] = value;
          });

          return params;
        } catch (err) {
          log('Error extracting data from URL', { url, error: err });
          return {};
        }
      },
      [log]
    );

    const checkUrlPattern = useCallback(
      (url: string, patterns: string[]): boolean => {
        const lowercaseUrl = url.toLowerCase();
        return patterns.some(pattern =>
          lowercaseUrl.includes(pattern.toLowerCase())
        );
      },
      []
    );

    const handleNavigationStateChange = useCallback(
      (navState: WebViewNavigation) => {
        const { url } = navState;
        log('Navigation state changed', { url });

        if (checkUrlPattern(url, successUrlPatterns)) {
          log('Success URL pattern matched');
          const data = extractDataFromUrl(url);
          setLoading(false);
          onSuccess(data);
        } else if (checkUrlPattern(url, failureUrlPatterns)) {
          log('Failure URL pattern matched');
          const data = extractDataFromUrl(url);
          setLoading(false);
          onFailure(data);
        }
      },
      [
        successUrlPatterns,
        failureUrlPatterns,
        onSuccess,
        onFailure,
        extractDataFromUrl,
        checkUrlPattern,
        log,
      ]
    );

    const handleLoadStart = useCallback(() => {
      log('WebView load started');
      setLoading(true);
      setError(null);
    }, [log]);

    const handleLoadEnd = useCallback(() => {
      log('WebView load ended');
      setLoading(false);
    }, [log]);

    const handleError = useCallback(
      (errorEvent: any) => {
        log('WebView error occurred', errorEvent);
        setLoading(false);
        setError('Failed to load payment page');
        onFailure({ error: 'WebView load error', details: errorEvent });
      },
      [onFailure, log]
    );

    const handleHttpError = useCallback(
      (errorEvent: any) => {
        log('WebView HTTP error occurred', errorEvent);
        setLoading(false);
        setError('Network error occurred');
        onFailure({ error: 'HTTP error', details: errorEvent });
      },
      [onFailure, log]
    );

    const renderLoading = () => {
      if (LoadingComponent) {
        return <LoadingComponent />;
      }

      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
          <Text style={styles.loadingText}>Loading payment...</Text>
        </View>
      );
    };

    const renderError = () => (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleReload}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );

    if (!transactionUrl) {
      return null;
    }

    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClose}
        style={[styles.modal, modalStyle]}
      >
        <SafeAreaView style={[styles.container, containerStyle]}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Payment</Text>
            <View style={styles.placeholder} />
          </View>

          {error ? (
            renderError()
          ) : (
            <>
              <WebView
                ref={webViewRef}
                source={{ uri: transactionUrl }}
                style={styles.webview}
                onNavigationStateChange={handleNavigationStateChange}
                onLoadStart={handleLoadStart}
                onLoadEnd={handleLoadEnd}
                onError={handleError}
                onHttpError={handleHttpError}
                startInLoadingState={true}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
                mixedContentMode="compatibility"
                thirdPartyCookiesEnabled={true}
                sharedCookiesEnabled={true}
                userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
              />
              {loading && renderLoading()}
            </>
          )}
        </SafeAreaView>
      </Modal>
    );
  }
);

MonifyPayment.displayName = 'MonifyPayment';

const styles = StyleSheet.create({
  modal: {
    margin: 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 36,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MonifyPayment;
