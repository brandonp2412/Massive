import {DarkTheme, DefaultTheme} from '@react-navigation/native';
import React from 'react';
import {useColorScheme} from 'react-native';
import {FAB} from 'react-native-paper';

export default function MassiveFab(
  props: Partial<React.ComponentProps<typeof FAB>>,
) {
  const dark = useColorScheme() === 'dark';

  return (
    <FAB
      {...props}
      icon="add"
      style={{
        position: 'absolute',
        right: 10,
        bottom: 60,
        backgroundColor: dark
          ? DarkTheme.colors.primary
          : DefaultTheme.colors.primary,
      }}
    />
  );
}
