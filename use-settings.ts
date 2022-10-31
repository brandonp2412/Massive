import React, {useContext} from 'react'
import Settings from './settings'

export const defaultSettings: Settings = {
  alarm: true,
  color: '',
  date: '',
  images: true,
  notify: false,
  showDate: false,
  showSets: true,
  showUnit: true,
  sound: '',
  steps: false,
  theme: 'system',
  vibrate: true,
  noSound: false,
}

export const SettingsContext = React.createContext<{
  settings: Settings
  setSettings: (value: Settings) => void
}>({
  settings: defaultSettings,
  setSettings: () => null,
})

export function useSettings() {
  return useContext(SettingsContext)
}
