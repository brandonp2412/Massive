import React from 'react'
import { Platform, Pressable } from 'react-native'
import { Switch as PaperSwitch, Text, useTheme } from 'react-native-paper'
import { MARGIN } from './constants'

function Switch({
  value,
  onChange,
  title,
}: {
  value?: boolean
  onChange: (value: boolean) => void
  title: string
}) {
  const { colors } = useTheme()

  return (
    <Pressable
      onPress={() => onChange(!value)}
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        marginBottom: Platform.OS === 'ios' ? MARGIN : null,
      }}
    >
      <PaperSwitch
        color={colors.primary}
        style={{ marginRight: MARGIN }}
        value={value}
        onValueChange={onChange}
        trackColor={{ true: colors.primary + '80', false: colors.surfaceDisabled }}
      />
      <Text>{title}</Text>
    </Pressable>
  )
}

export default React.memo(Switch)
