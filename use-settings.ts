import React, {useContext} from 'react';
import Settings from './settings';

export const SettingsContext = React.createContext<{
  settings: Settings;
  setSettings: (value: Settings) => void;
}>({
  settings: {
    alarm: 0,
    vibrate: 1,
    showDate: 0,
  },
  setSettings: () => null,
});

export function useSettings() {
  return useContext(SettingsContext);
}
