import {ComponentProps} from 'react'
import {FAB, useTheme} from 'react-native-paper'
import {CombinedDarkTheme, CombinedDefaultTheme} from './App'
import {lightColors} from './colors'

export default function MassiveFab(props: Partial<ComponentProps<typeof FAB>>) {
  const {colors} = useTheme()

  const fabColor = lightColors
    .map(lightColor => lightColor.hex)
    .includes(colors.primary)
    ? CombinedDarkTheme.colors.background
    : CombinedDefaultTheme.colors.background

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
