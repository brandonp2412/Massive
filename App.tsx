import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  NavigationContainer,
} from '@react-navigation/native'
import React, { useEffect, useMemo, useState } from 'react'
import { DeviceEventEmitter, useColorScheme } from 'react-native'
import {
  MD3DarkTheme as PaperDarkTheme,
  MD3LightTheme as PaperDefaultTheme,
  Provider as PaperProvider,
  Snackbar,
} from 'react-native-paper'
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'
import { AppDataSource } from './data-source'
import { settingsRepo } from './db'
import Routes from './Routes'
import { TOAST } from './toast'
import { ThemeContext } from './use-theme'

export const CombinedDefaultTheme = {
  ...NavigationDefaultTheme,
  ...PaperDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    ...PaperDefaultTheme.colors,
  },
}

export const CombinedDarkTheme = {
  ...NavigationDarkTheme,
  ...PaperDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    ...PaperDarkTheme.colors,
  },
}

const App = () => {
  const isDark = useColorScheme() === 'dark'
  const [initialized, setInitialized] = useState(false)
  const [snackbar, setSnackbar] = useState('')
  const [theme, setTheme] = useState('system')

  const [lightColor, setLightColor] = useState<string>(
    CombinedDefaultTheme.colors.primary,
  )

  const [darkColor, setDarkColor] = useState<string>(
    CombinedDarkTheme.colors.primary,
  )

  useEffect(() => {
    ;(async () => {
      if (!AppDataSource.isInitialized) await AppDataSource.initialize()
      const settings = await settingsRepo.findOne({ where: {} })
      setTheme(settings.theme)
      if (settings.lightColor) setLightColor(settings.lightColor)
      if (settings.darkColor) setDarkColor(settings.darkColor)
      setInitialized(true)
    })()
    const description = DeviceEventEmitter.addListener(
      TOAST,
      ({ value }: { value: string }) => {
        setSnackbar(value)
      },
    )
    return description.remove
  }, [])

  const paperTheme = useMemo(() => {
    const darkTheme = lightColor
      ? {
        ...CombinedDarkTheme,
        colors: { ...CombinedDarkTheme.colors, primary: darkColor },
      }
      : CombinedDarkTheme
    const lightTheme = lightColor
      ? {
        ...CombinedDefaultTheme,
        colors: { ...CombinedDefaultTheme.colors, primary: lightColor },
      }
      : CombinedDefaultTheme
    let value = isDark ? darkTheme : lightTheme
    if (theme === 'dark') value = darkTheme
    else if (theme === 'light') value = lightTheme
    return value
  }, [isDark, theme, lightColor, darkColor])

  const action = useMemo(
    () => ({
      label: 'Close',
      onPress: () => setSnackbar(''),
      color: paperTheme.colors.background,
    }),
    [paperTheme.colors.background],
  )

  return (
    <PaperProvider
      theme={paperTheme}
      settings={{ icon: (props) => <MaterialIcon {...props} /> }}
    >
      <NavigationContainer theme={paperTheme}>
        {initialized && (
          <ThemeContext.Provider
            value={{
              theme,
              setTheme,
              lightColor,
              setLightColor,
              darkColor,
              setDarkColor,
            }}
          >
            <Routes />
          </ThemeContext.Provider>
        )}
      </NavigationContainer>

      <Snackbar
        duration={3000}
        onDismiss={() => setSnackbar('')}
        visible={!!snackbar}
        action={action}
      >
        {snackbar}
      </Snackbar>
    </PaperProvider>
  )
}

export default App
