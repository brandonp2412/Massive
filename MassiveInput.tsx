import {ComponentProps, Ref} from 'react';
import {TextInput} from 'react-native-paper';
import {CombinedDefaultTheme} from './App';
import {MARGIN} from './constants';
import useDark from './use-dark';

export default function MassiveInput(
  props: Partial<ComponentProps<typeof TextInput>> & {
    innerRef?: Ref<any>;
  },
) {
  const dark = useDark();

  return (
    <TextInput
      selectionColor={dark ? '#2A2A2A' : CombinedDefaultTheme.colors.border}
      mode="outlined"
      style={{marginBottom: MARGIN, minWidth: 100}}
      selectTextOnFocus
      ref={props.innerRef}
      blurOnSubmit={false}
      {...props}
    />
  );
}
