import 'react-native-gesture-handler/jestSetup';
import {NativeModules as RNNativeModules} from 'react-native';

//RNNativeModules.UIManager = RNNativeModules.UIManager || {};
//RNNativeModules.UIManager.RCTView = RNNativeModules.UIManager.RCTView || {};
//RNNativeModules.RNGestureHandlerModule =
//  RNNativeModules.RNGestureHandlerModule || {
//    State: {BEGAN: 'BEGAN', FAILED: 'FAILED', ACTIVE: 'ACTIVE', END: 'END'},
//    attachGestureHandler: jest.fn(),
//    createGestureHandler: jest.fn(),
//    dropGestureHandler: jest.fn(),
//    updateGestureHandler: jest.fn(),
//  };
//RNNativeModules.PlatformConstants = RNNativeModules.PlatformConstants || {
//  forceTouchAvailable: false,
//};
RNNativeModules.RNViewShot = RNNativeModules.RNViewShot || {
  captureScreen: jest.fn(),
};

jest.mock('react-native-file-access', () => jest.fn());
jest.mock('react-native-share', () => jest.fn());
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
jest.useFakeTimers();
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});
