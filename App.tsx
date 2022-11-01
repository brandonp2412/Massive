import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  NavigationContainer,
} from '@react-navigation/native'
import {useEffect, useMemo, useState} from 'react'
import {DeviceEventEmitter, useColorScheme} from 'react-native'
import React from 'react'
import {
  DarkTheme as PaperDarkTheme,
  DefaultTheme as PaperDefaultTheme,
  Provider as PaperProvider,
  Snackbar,
} from 'react-native-paper'
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'
import {lightColors} from './colors'
import {AppDataSource} from './data-source'
import {settingsRepo} from './db'
import Routes from './Routes'
import {TOAST} from './toast'
import {ThemeContext} from './use-theme'

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
    primary: lightColors[0].hex,
    background: '#0E0E0E',
  },
}

const App = () => {
  const isDark = useColorScheme() === 'dark'
  const [initialized, setInitialized] = useState(false)
  const [snackbar, setSnackbar] = useState('')
  const [theme, setTheme] = useState('system')

  const [color, setColor] = useState<string>(
    isDark
      ? CombinedDarkTheme.colors.primary
      : CombinedDefaultTheme.colors.primary,
  )

  useEffect(() => {
    AppDataSource.initialize().then(async () => {
      const settings = await settingsRepo.findOne({where: {}})
      console.log(`${App.name}.useEffect:`, {gotSettings: settings})
      setTheme(settings.theme)
      setColor(settings.color)
      setInitialized(true)
    })
    DeviceEventEmitter.addListener(TOAST, ({value}: {value: string}) => {
      console.log(`${Routes.name}.toast:`, {value})
      setSnackbar(value)
    })
  }, [])

  const paperTheme = useMemo(() => {
    const darkTheme = color
      ? {
          ...CombinedDarkTheme,
          colors: {...CombinedDarkTheme.colors, primary: color},
        }
      : CombinedDarkTheme
    const lightTheme = color
      ? {
          ...CombinedDefaultTheme,
          colors: {...CombinedDefaultTheme.colors, primary: color},
        }
      : CombinedDefaultTheme
    let value = isDark ? darkTheme : lightTheme
    if (theme === 'dark') value = darkTheme
    else if (theme === 'light') value = lightTheme
    return value
  }, [isDark, theme, color])

  const action = useMemo(
    () => ({
      label: 'Close',
      onPress: () => setSnackbar(''),
      color: paperTheme.colors.primary,
    }),
    [paperTheme.colors.primary],
  )

  return (
    <PaperProvider
      theme={paperTheme}
      settings={{icon: props => <MaterialIcon {...props} />}}>
      <NavigationContainer theme={paperTheme}>
        {initialized && (
          <ThemeContext.Provider value={{theme, setTheme, color, setColor}}>
            <Routes />
          </ThemeContext.Provider>
        )}
      </NavigationContainer>

      <Snackbar
        duration={3000}
        onDismiss={() => setSnackbar('')}
        visible={!!snackbar}
        action={action}>
        {snackbar}
      </Snackbar>
    </PaperProvider>
  )
}

export default App
