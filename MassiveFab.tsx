import {AnimatedFAB} from 'react-native-paper';
import React from 'react';

export default function MassiveFab(
  props: Partial<React.ComponentProps<typeof AnimatedFAB>>,
) {
  return (
    <AnimatedFAB
      {...props}
      extended={false}
      label="Add"
      icon="add"
      style={{position: 'absolute', right: 10, bottom: 60}}
    />
  );
}
