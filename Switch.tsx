import {Control, Controller} from 'react-hook-form'
import {Platform, Pressable} from 'react-native'
import {Switch as PaperSwitch, Text, useTheme} from 'react-native-paper'
import {MARGIN} from './constants'

export default function Switch({
  control,
  name,
  children,
}: {
  name: string
  control: Control<any, any>
  children: string
}) {
  const {colors} = useTheme()

  return (
    <Controller
      name={name}
      control={control}
      render={({field: {onChange, value}}) => (
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
          />
          <Text>{children}</Text>
        </Pressable>
      )}
    />
  )
}
