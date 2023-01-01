import 'react-native-gesture-handler/jestSetup'
import {NativeModules as RNNativeModules} from 'react-native'

RNNativeModules.RNViewShot = RNNativeModules.RNViewShot || {
  captureScreen: jest.fn(),
}

jest.mock('react-native-file-access', () => jest.fn())
jest.mock('react-native-share', () => jest.fn())
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')
//jest.mock('react-native-reanimated', () => {
//  const Reanimated = require('react-native-reanimated/mock')
//  Reanimated.default.call = () => {}
//  return Reanimated
//})
