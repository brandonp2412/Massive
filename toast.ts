import {DeviceEventEmitter} from 'react-native'

export const TOAST = 'toast'

export function toast(value: string) {
  DeviceEventEmitter.emit(TOAST, {value})
}
