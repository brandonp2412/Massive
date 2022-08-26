import React from 'react';
import {useColorScheme} from 'react-native';
import {FAB} from 'react-native-paper';
import {CombinedDarkTheme, CombinedDefaultTheme} from './App';

export default function MassiveFab(
  props: Partial<React.ComponentProps<typeof FAB>>,
) {
  const dark = useColorScheme() === 'dark';

  return (
    <FAB
      {...props}
      icon="add"
      color="black"
      style={{
        position: 'absolute',
        right: 10,
        bottom: 60,
        backgroundColor: dark
          ? CombinedDarkTheme.colors.primary
          : CombinedDefaultTheme.colors.primary,
      }}
    />
  );
}
