import React, {useContext} from 'react';
import {Switch} from 'react-native-paper';
import {CustomTheme} from './App';
import {MARGIN} from './constants';

export default function MassiveSwitch(
  props: Partial<React.ComponentProps<typeof Switch>>,
) {
  const {color} = useContext(CustomTheme);

  return <Switch color={color} style={{marginRight: MARGIN}} {...props} />;
}
