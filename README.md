# monify-react-native

A React Native package for integrating Monify payment gateway using WebView with TypeScript support.

## Features

- 🔒 Secure WebView-based payment integration
- 🎯 TypeScript support with full type definitions
- 🪝 Easy-to-use React hook (`useMonifyPayment`)
- 📱 Cross-platform (iOS & Android)
- ⚡ Lightweight and performant
- 🎨 Customizable UI components
- 🐛 Built-in error handling and debugging
- 🔄 Automatic success/failure detection
- 📋 Comprehensive callback system

## Installation

> **Note:** This package requires [`react-native-webview`](https://github.com/react-native-webview/react-native-webview) as a peer dependency. You must install it in your project for `monify-react-native` to work correctly.

```bash
npm install monify-react-native react-native-webview
```

### Additional Setup

Since this package depends on `react-native-webview`, you need to complete the platform-specific setup:

#### iOS

```bash
cd ios && pod install
```

#### Android

No additional setup required for Android.

## Usage

### Method 1: Using the Hook (Recommended)

```tsx
import React from 'react';
import { View, TouchableOpacity, Text, Alert } from 'react-native';
import { MonifyPayment, useMonifyPayment } from 'monify-react-native';

const PaymentScreen = () => {
  const {
    isVisible,
    isLoading,
    startPayment,
    transactionUrl,
    config,
    paymentRef,
  } = useMonifyPayment({
    onSuccess: data => {
      Alert.alert('Success', 'Payment completed successfully!');
      console.log('Payment data:', data);
    },
    onFailure: error => {
      Alert.alert('Error', 'Payment failed');
      console.error('Payment error:', error);
    },
    onCancel: () => {
      Alert.alert('Cancelled', 'Payment was cancelled');
    },
    debug: true, // Enable debug logs
  });

  const handlePayment = () => {
    const transactionUrl =
      'https://sandbox.monnify.com/checkout/YOUR_TRANSACTION_URL';
    startPayment(transactionUrl);
  };

  return (
    <View>
      <TouchableOpacity onPress={handlePayment} disabled={isLoading}>
        <Text>{isLoading ? 'Processing...' : 'Pay Now'}</Text>
      </TouchableOpacity>

      <MonifyPayment
        ref={paymentRef}
        visible={isVisible}
        transactionUrl={transactionUrl || ''}
        onSuccess={config.onSuccess!}
        onFailure={config.onFailure!}
        onCancel={config.onCancel}
        debug={config.debug}
      />
    </View>
  );
};
```

### Method 2: Direct Component Usage

```tsx
import React, { useState } from 'react';
import { MonifyPayment } from 'monify-react-native';

const PaymentScreen = () => {
  const [visible, setVisible] = useState(false);
  const transactionUrl =
    'https://sandbox.monnify.com/checkout/YOUR_TRANSACTION_URL';

  return (
    <>
      <TouchableOpacity onPress={() => setVisible(true)}>
        <Text>Pay Now</Text>
      </TouchableOpacity>

      <MonifyPayment
        visible={visible}
        transactionUrl={transactionUrl}
        onSuccess={data => {
          setVisible(false);
          console.log('Payment successful:', data);
        }}
        onFailure={error => {
          setVisible(false);
          console.error('Payment failed:', error);
        }}
        onCancel={() => setVisible(false)}
      />
    </>
  );
};
```

## API Reference

### MonifyPayment Props

| Prop                 | Type                    | Required | Description                          |
| -------------------- | ----------------------- | -------- | ------------------------------------ |
| `transactionUrl`     | `string`                | ✅       | The Monify transaction URL           |
| `visible`            | `boolean`               | ✅       | Whether the payment modal is visible |
| `onSuccess`          | `(data?: any) => void`  | ✅       | Callback for successful payments     |
| `onFailure`          | `(error?: any) => void` | ✅       | Callback for failed payments         |
| `onCancel`           | `() => void`            | ❌       | Callback for cancelled payments      |
| `LoadingComponent`   | `React.ComponentType`   | ❌       | Custom loading component             |
| `modalStyle`         | `object`                | ❌       | Custom modal styles                  |
| `containerStyle`     | `object`                | ❌       | Custom container styles              |
| `successUrlPatterns` | `string[]`              | ❌       | URL patterns for success detection   |
| `failureUrlPatterns` | `string[]`              | ❌       | URL patterns for failure detection   |
| `debug`              | `boolean`               | ❌       | Enable debug logging                 |

### useMonifyPayment Hook

```tsx
const {
  isVisible,
  isLoading,
  transactionUrl,
  error,
  startPayment,
  closePayment,
  reloadPayment,
  clearError,
  paymentRef,
  config,
} = useMonifyPayment(config);
```

#### Hook Configuration

| Property             | Type                    | Description                |
| -------------------- | ----------------------- | -------------------------- |
| `onSuccess`          | `(data?: any) => void`  | Success callback           |
| `onFailure`          | `(error?: any) => void` | Failure callback           |
| `onCancel`           | `() => void`            | Cancel callback            |
| `successUrlPatterns` | `string[]`              | Success detection patterns |
| `failureUrlPatterns` | `string[]`              | Failure detection patterns |
| `debug`              | `boolean`               | Enable debug mode          |

#### Hook Return Values

| Property         | Type                    | Description              |
| ---------------- | ----------------------- | ------------------------ |
| `isVisible`      | `boolean`               | Modal visibility state   |
| `isLoading`      | `boolean`               | Loading state            |
| `transactionUrl` | `string \| null`        | Current transaction URL  |
| `error`          | `string \| null`        | Error message            |
| `startPayment`   | `(url: string) => void` | Start payment function   |
| `closePayment`   | `() => void`            | Close payment function   |
| `reloadPayment`  | `() => void`            | Reload payment function  |
| `clearError`     | `() => void`            | Clear error function     |
| `paymentRef`     | `RefObject`             | Ref to payment component |
| `config`         | `object`                | Processed configuration  |

### MonifyUtils

Utility functions for common operations:

```tsx
import { MonifyUtils } from 'monify-react-native';

// Validate transaction URL
const isValid = MonifyUtils.isValidTransactionUrl(url);

// Extract transaction reference
const ref = MonifyUtils.extractTransactionRef(url);

// Check if URL indicates success
const isSuccess = MonifyUtils.isSuccessUrl(url);

// Check if URL indicates failure
const isFailure = MonifyUtils.isFailureUrl(url);
```

## Customization

### Custom Loading Component

```tsx
const CustomLoader = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Processing your payment...</Text>
  </View>
);

<MonifyPayment
  LoadingComponent={CustomLoader}
  // ... other props
/>;
```

### Custom URL Patterns

```tsx
<MonifyPayment
  successUrlPatterns={['success', 'completed', 'approved']}
  failureUrlPatterns={['failed', 'error', 'declined']}
  // ... other props
/>
```

### Custom Styling

```tsx
<MonifyPayment
  modalStyle={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
  containerStyle={{ borderRadius: 10 }}
  // ... other props
/>
```

## Error Handling

The package provides comprehensive error handling:

```tsx
const { error, clearError } = useMonifyPayment({
  onFailure: error => {
    console.log('Error type:', error.error);
    console.log('Error details:', error.details);
  },
});

// Clear errors manually
if (error) {
  clearError();
}
```

## Debugging

Enable debug mode to see detailed logs:

```tsx
useMonifyPayment({
  debug: true, // This will log navigation events and errors
});
```

## Security Considerations

- Always use HTTPS URLs for transaction URLs
- Validate transaction URLs before passing to the component
- Implement proper error handling for failed payments
- Store sensitive payment data securely on your backend

## Example Integration

Here's a complete example with proper error handling:

```tsx
import React from 'react';
import { View, TouchableOpacity, Text, Alert, StyleSheet } from 'react-native';
import {
  MonifyPayment,
  useMonifyPayment,
  MonifyUtils,
} from 'monify-react-native';

const PaymentScreen = () => {
  const {
    isVisible,
    isLoading,
    error,
    startPayment,
    closePayment,
    transactionUrl,
    config,
    paymentRef,
  } = useMonifyPayment({
    onSuccess: data => {
      Alert.alert(
        'Payment Successful',
        'Your payment has been processed successfully!',
        [{ text: 'OK', onPress: () => navigateToSuccess() }]
      );
    },
    onFailure: error => {
      Alert.alert(
        'Payment Failed',
        error?.error || 'Something went wrong with your payment.',
        [{ text: 'Try Again', onPress: () => closePayment() }]
      );
    },
    onCancel: () => {
      Alert.alert('Payment Cancelled', 'You have cancelled the payment.');
    },
    debug: __DEV__, // Enable debug in development
  });

  const handlePayment = async () => {
    try {
      // Get transaction URL from your backend
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 1000, currency: 'NGN' }),
      });

      const { transactionUrl } = await response.json();

      if (MonifyUtils.isValidTransactionUrl(transactionUrl)) {
        startPayment(transactionUrl);
      } else {
        Alert.alert('Error', 'Invalid transaction URL received');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to initiate payment');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handlePayment}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Processing...' : 'Pay ₦1,000'}
        </Text>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>Error: {error}</Text>}

      <MonifyPayment
        ref={paymentRef}
        visible={isVisible}
        transactionUrl={transactionUrl || ''}
        onSuccess={config.onSuccess!}
        onFailure={config.onFailure!}
        onCancel={config.onCancel}
        debug={config.debug}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  button: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#d32f2f',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default PaymentScreen;
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/monify-react-native/issues) page
2. Create a new issue if your problem isn't already reported
3. Provide detailed information about your setup and the error

## Changelog

### 1.0.0

- Initial release
- Basic WebView integration
- TypeScript support
- useMonifyPayment hook
- Comprehensive error handling
- Debug mode support
