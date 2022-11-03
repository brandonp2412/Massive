import {ComponentProps} from 'react'
import {FAB} from 'react-native-paper'
import {CombinedDarkTheme, CombinedDefaultTheme} from './App'
import {lightColors} from './colors'
import {useTheme} from './use-theme'

export default function MassiveFab(props: Partial<ComponentProps<typeof FAB>>) {
  const {color} = useTheme()

  const fabColor = lightColors.includes(color)
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
        backgroundColor: color,
      }}
      {...props}
    />
  )
}
