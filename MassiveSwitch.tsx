import React from 'react';
import {DarkTheme, DefaultTheme} from '@react-navigation/native';
import {useColorScheme} from 'react-native';
import {Switch} from 'react-native-paper';

export default function MassiveSwitch(
  props: Partial<React.ComponentProps<typeof Switch>>,
) {
  const dark = useColorScheme() === 'dark';

  return (
    <Switch
      color={dark ? DarkTheme.colors.primary : DefaultTheme.colors.primary}
      style={{marginRight: 5}}
      {...props}
    />
  );
}
