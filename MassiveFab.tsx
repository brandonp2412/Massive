import React, {useContext} from 'react';
import {FAB} from 'react-native-paper';
import {CustomTheme} from './App';
import {lightColors} from './colors';

export default function MassiveFab(
  props: Partial<React.ComponentProps<typeof FAB>>,
) {
  const {color} = useContext(CustomTheme);
  const fabColor = lightColors.map(lightColor => lightColor.hex).includes(color)
    ? 'black'
    : undefined;

  return (
    <FAB
      {...props}
      icon="add"
      color={fabColor}
      style={{
        position: 'absolute',
        right: 10,
        bottom: 60,
        backgroundColor: color,
      }}
    />
  );
}
