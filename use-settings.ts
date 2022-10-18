import React, {useContext} from 'react';
import Settings from './settings';

export const SettingsContext = React.createContext<{
  settings: Settings;
  setSettings: (value: Settings) => void;
}>({
  settings: {
    alarm: 0,
    color: '',
    date: '',
    images: 1,
    notify: 0,
    showDate: 0,
    showSets: 1,
    showUnit: 1,
    sound: '',
    steps: 0,
    theme: 'system',
    vibrate: 1,
  },
  setSettings: () => null,
});

export function useSettings() {
  return useContext(SettingsContext);
}
