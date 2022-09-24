import React, {useContext} from 'react';
import {FAB} from 'react-native-paper';
import {CustomTheme} from './App';

export default function MassiveFab(
  props: Partial<React.ComponentProps<typeof FAB>>,
) {
  const {color} = useContext(CustomTheme);

  return (
    <FAB
      {...props}
      icon="add"
      style={{
        position: 'absolute',
        right: 10,
        bottom: 60,
        backgroundColor: color,
      }}
    />
  );
}
