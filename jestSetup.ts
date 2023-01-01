import {NativeModules} from 'react-native'
import 'react-native-gesture-handler/jestSetup'

NativeModules.RNViewShot = NativeModules.RNViewShot || {
  captureScreen: jest.fn(),
}
NativeModules.SettingsModule = NativeModules.SettingsModule || {
  ignoringBattery: jest.fn(),
  is24: jest.fn(() => Promise.resolve(true)),
}

jest.mock('react-native-file-access', () => jest.fn())
jest.mock('react-native-share', () => jest.fn())
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter')

//jest.mock('react-native-reanimated', () => {
//  const Reanimated = require('react-native-reanimated/mock')
//  Reanimated.default.call = () => {}
//  return Reanimated
//})
