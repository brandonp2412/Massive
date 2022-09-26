import React, {useContext} from 'react';
import {Pressable} from 'react-native';
import {Switch as PaperSwitch, Text} from 'react-native-paper';
import {CustomTheme} from './App';
import {MARGIN} from './constants';

export default function Switch({
  value,
  onValueChange,
  onPress,
  children,
}: {
  value?: boolean;
  onValueChange: (value: boolean) => void;
  onPress: () => void;
  children: string;
}) {
  const {color} = useContext(CustomTheme);

  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
      <PaperSwitch
        color={color}
        style={{marginRight: MARGIN}}
        value={value}
        onValueChange={onValueChange}
      />
      <Text>{children}</Text>
    </Pressable>
  );
}
