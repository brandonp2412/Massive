import {ComponentProps} from 'react'
import {FAB, useTheme} from 'react-native-paper'
import {lightColors} from './colors'

export default function MassiveFab(props: Partial<ComponentProps<typeof FAB>>) {
  const {colors} = useTheme()

  const fabColor = lightColors
    .map(lightColor => lightColor.hex)
    .includes(colors.primary)
    ? 'black'
    : undefined

  return (
    <FAB
      icon="add"
      color={fabColor}
      style={{
        position: 'absolute',
        right: 10,
        bottom: 10,
        backgroundColor: colors.primary,
      }}
      {...props}
    />
  )
}
