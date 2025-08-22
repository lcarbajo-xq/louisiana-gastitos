import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock'
import 'react-native-gesture-handler/jestSetup'

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage)

// Mock react-native modules
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter')
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock')
  Reanimated.default.call = () => {}
  return Reanimated
})

// Mock react-native-svg
jest.mock('react-native-svg', () => ({
  Svg: 'Svg',
  Circle: 'Circle',
  Path: 'Path',
  G: 'G',
  Text: 'Text',
  Line: 'Line',
  Rect: 'Rect',
  LinearGradient: 'LinearGradient',
  Defs: 'Defs',
  Stop: 'Stop'
}))

// Mock Victory Charts
jest.mock('victory-native', () => ({
  VictoryPie: 'VictoryPie',
  VictoryChart: 'VictoryChart',
  VictoryLine: 'VictoryLine',
  VictoryBar: 'VictoryBar',
  VictoryArea: 'VictoryArea',
  VictoryAxis: 'VictoryAxis',
  VictoryTheme: {
    material: {},
    grayscale: {}
  }
}))

// Mock react-native-fs
jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/mock/documents',
  writeFile: jest.fn(() => Promise.resolve()),
  readFile: jest.fn(() => Promise.resolve('')),
  exists: jest.fn(() => Promise.resolve(true)),
  unlink: jest.fn(() => Promise.resolve()),
  mkdir: jest.fn(() => Promise.resolve())
}))

// Mock react-native-share
jest.mock('react-native-share', () => ({
  default: {
    open: jest.fn(() => Promise.resolve()),
    shareSingle: jest.fn(() => Promise.resolve())
  }
}))

// Mock react-native-background-job
jest.mock('react-native-background-job', () => ({
  default: {
    register: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    isRunning: jest.fn(() => false)
  }
}))

// Mock react-native-biometrics
jest.mock('react-native-biometrics', () => ({
  default: {
    isSensorAvailable: jest.fn(() =>
      Promise.resolve({ available: true, biometryType: 'FaceID' })
    ),
    simplePrompt: jest.fn(() => Promise.resolve({ success: true })),
    createKeys: jest.fn(() => Promise.resolve()),
    deleteKeys: jest.fn(() => Promise.resolve())
  }
}))

// Mock react-native-keychain
jest.mock('react-native-keychain', () => ({
  setInternetCredentials: jest.fn(() => Promise.resolve()),
  getInternetCredentials: jest.fn(() =>
    Promise.resolve({ username: 'test', password: 'test' })
  ),
  resetInternetCredentials: jest.fn(() => Promise.resolve()),
  canImplyAuthentication: jest.fn(() => Promise.resolve(true))
}))

// Mock Expo modules if needed
jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      name: 'Louisiana Gastitos',
      slug: 'louisiana-gastitos'
    }
  }
}))

// Silence console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn()
}

// Mock performance.now for testing
global.performance = {
  now: jest.fn(() => Date.now())
}
