import {useMemo} from 'react'
import {Pressable} from 'react-native'
import {Switch as PaperSwitch, Text, useTheme} from 'react-native-paper'
import {CombinedDarkTheme, CombinedDefaultTheme} from './App'
import {colorShade} from './colors'
import {MARGIN} from './constants'
import useDark from './use-dark'

export default function Switch({
  value,
  onValueChange,
  onPress,
  children,
}: {
  value?: boolean
  onValueChange: (value: boolean) => void
  onPress: () => void
  children: string
}) {
  const {colors} = useTheme()
  const dark = useDark()

  const track = useMemo(() => {
    if (dark)
      return {
        false: CombinedDarkTheme.colors.placeholder,
        true: colorShade(colors.primary, -40),
      }
    return {
      false: CombinedDefaultTheme.colors.placeholder,
      true: colorShade(colors.primary, -40),
    }
  }, [dark, colors.primary])

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
        color={colors.primary}
        style={{marginRight: MARGIN}}
        value={value}
        onValueChange={onValueChange}
      />
      <Text>{children}</Text>
    </Pressable>
  )
}
