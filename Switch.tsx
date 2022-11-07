import {Pressable} from 'react-native'
import {Switch as PaperSwitch, Text, useTheme} from 'react-native-paper'
import {MARGIN} from './constants'

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

  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
      <PaperSwitch
        color={colors.primary}
        style={{marginRight: MARGIN}}
        value={value}
        onValueChange={onValueChange}
      />
      <Text>{children}</Text>
    </Pressable>
  )
}
