import 'react-native-gesture-handler/jestSetup';

// Mock react-native-webview
jest.mock('react-native-webview', () => {
  const { View } = require('react-native');
  return {
    WebView: View,
  };
});

// Mock react-native modules
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');

  return {
    ...RN,
    Alert: {
      alert: jest.fn(),
    },
  };
});

// Silence the warning: Animated: `useNativeDriver` is not supported
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
