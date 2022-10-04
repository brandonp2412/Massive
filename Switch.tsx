import React, {useContext, useMemo} from 'react';
import {Pressable} from 'react-native';
import {Switch as PaperSwitch, Text} from 'react-native-paper';
import {CombinedDarkTheme, CombinedDefaultTheme, CustomTheme} from './App';
import {colorShade} from './colors';
import {MARGIN} from './constants';
import useDark from './use-dark';

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
  const dark = useDark();

  const track = useMemo(() => {
    if (dark)
      return {
        false: CombinedDarkTheme.colors.placeholder,
        true: colorShade(color, -40),
      };
    return {
      false: CombinedDefaultTheme.colors.placeholder,
      true: colorShade(color, -40),
    };
  }, [dark, color]);

  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
      <PaperSwitch
        trackColor={track}
        color={color}
        style={{marginRight: MARGIN}}
        value={value}
        onValueChange={onValueChange}
      />
      <Text>{children}</Text>
    </Pressable>
  );
}
