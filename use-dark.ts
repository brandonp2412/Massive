import {useColorScheme} from 'react-native';
import {useSettings} from './use-settings';

export default function useDark() {
  const dark = useColorScheme() === 'dark';
  const {settings} = useSettings();

  if (settings.theme === 'dark') return true;
  if (settings.theme === 'light') return false;
  return dark;
}
