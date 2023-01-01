import {ComponentProps, useMemo} from 'react'
import {FAB, useTheme} from 'react-native-paper'
import {CombinedDarkTheme, CombinedDefaultTheme} from './App'
import {lightColors} from './colors'

export default function AppFab(props: Partial<ComponentProps<typeof FAB>>) {
  const {colors} = useTheme()

  const fabColor = useMemo(
    () =>
      lightColors.map(color => color.hex).includes(colors.primary)
        ? CombinedDarkTheme.colors.background
        : CombinedDefaultTheme.colors.background,
    [colors.primary],
  )

  return (
    <FAB
      icon="add"
      testID="add"
      color={fabColor}
      style={{
        position: 'absolute',
        right: 20,
        bottom: 20,
        backgroundColor: colors.primary,
      }}
      {...props}
    />
  )
}
