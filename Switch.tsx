import {Platform, Pressable} from 'react-native'
import {Switch as PaperSwitch, Text, useTheme} from 'react-native-paper'
import {MARGIN} from './constants'

export default function Switch({
  value,
  onChange,
  onPress,
  children,
}: {
  value?: boolean
  onChange: (value: boolean) => void
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
        marginBottom: Platform.OS === 'ios' ? MARGIN : null,
      }}>
      <PaperSwitch
        color={colors.primary}
        style={{marginRight: MARGIN}}
        value={value}
        onValueChange={onChange}
      />
      <Text>{children}</Text>
    </Pressable>
  )
}
