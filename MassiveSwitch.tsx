import React from 'react';
import {useColorScheme} from 'react-native';
import {Switch} from 'react-native-paper';
import {CombinedDarkTheme, CombinedDefaultTheme} from './App';
import {MARGIN} from './constants';

export default function MassiveSwitch(
  props: Partial<React.ComponentProps<typeof Switch>>,
) {
  const dark = useColorScheme() === 'dark';

  return (
    <Switch
      color={
        dark
          ? CombinedDarkTheme.colors.primary
          : CombinedDefaultTheme.colors.primary
      }
      style={{marginRight: MARGIN}}
      {...props}
    />
  );
}
