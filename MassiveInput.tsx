import React from 'react';
import {useColorScheme} from 'react-native';
import {TextInput} from 'react-native-paper';

export default function MassiveInput(
  props: Partial<React.ComponentProps<typeof TextInput>> & {
    innerRef?: React.Ref<any>;
  },
) {
  const dark = useColorScheme() === 'dark';

  return (
    <TextInput
      selectionColor={dark ? '#2A2A2A' : ''}
      mode="outlined"
      style={{marginBottom: 10}}
      selectTextOnFocus
      ref={props.innerRef}
      {...props}
    />
  );
}
