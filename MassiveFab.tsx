import React, {useContext} from 'react';
import {useColorScheme} from 'react-native';
import {FAB} from 'react-native-paper';
import {CombinedDarkTheme, CustomTheme} from './App';

export default function MassiveFab(
  props: Partial<React.ComponentProps<typeof FAB>>,
) {
  const dark = useColorScheme() === 'dark';
  const {color} = useContext(CustomTheme);

  return (
    <FAB
      {...props}
      icon="add"
      color={dark ? CombinedDarkTheme.colors.background : 'white'}
      style={{
        position: 'absolute',
        right: 10,
        bottom: 60,
        backgroundColor: color,
      }}
    />
  );
}
