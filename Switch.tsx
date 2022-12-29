import {Platform, Pressable} from 'react-native'
import {Switch as PaperSwitch, Text, useTheme} from 'react-native-paper'
import {MARGIN} from './constants'

export default function Switch({
  value,
  onChange,
  children,
}: {
  value?: boolean
  onChange: (value: boolean) => void
  children: string
}) {
  const {colors} = useTheme()

  return (
    <Pressable
      onPress={() => onChange(!value)}
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
        trackColor={{true: colors.primary + '80', false: colors.disabled}}
      />
      <Text>{children}</Text>
    </Pressable>
  )
}
