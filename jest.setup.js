// Mock React Native modules that might not be available in the test environment
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock Expo modules
jest.mock('expo-font');
jest.mock('expo-asset');
jest.mock('expo-constants', () => ({
  manifest: {
    extra: {
      firebaseConfig: {
        apiKey: 'test-api-key',
        authDomain: 'test-auth-domain',
        projectId: 'test-project-id',
        storageBucket: 'test-storage-bucket',
        messagingSenderId: 'test-messaging-sender-id',
        appId: 'test-app-id',
        measurementId: 'test-measurement-id'
      }
    }
  }
}));

// Mock cheerio
jest.mock('cheerio', () => ({
  load: jest.fn(() => ({
    $: jest.fn()
  }))
}));

// Mock axios
jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: '' }))
})); 