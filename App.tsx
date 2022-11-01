import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  NavigationContainer,
} from '@react-navigation/native'
import {useEffect, useMemo, useState} from 'react'
import {DeviceEventEmitter, useColorScheme} from 'react-native'
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
import Settings from './settings'
import {TOAST} from './toast'
import {defaultSettings, SettingsContext} from './use-settings'

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

  const [settings, setSettings] = useState<Settings>({
    ...defaultSettings,
    color: isDark
      ? CombinedDarkTheme.colors.primary
      : CombinedDefaultTheme.colors.primary,
  })

  useEffect(() => {
    AppDataSource.initialize().then(async () => {
      const gotSettings = await settingsRepo.findOne({where: {}})
      console.log(`${App.name}.useEffect:`, {gotSettings})
      setSettings(gotSettings)
      setInitialized(true)
    })
    DeviceEventEmitter.addListener(TOAST, ({value}: {value: string}) => {
      console.log(`${Routes.name}.toast:`, {value})
      setSnackbar(value)
    })
  }, [])

  const theme = useMemo(() => {
    const darkTheme = settings?.color
      ? {
          ...CombinedDarkTheme,
          colors: {...CombinedDarkTheme.colors, primary: settings.color},
        }
      : CombinedDarkTheme
    const lightTheme = settings?.color
      ? {
          ...CombinedDefaultTheme,
          colors: {...CombinedDefaultTheme.colors, primary: settings.color},
        }
      : CombinedDefaultTheme
    let value = isDark ? darkTheme : lightTheme
    if (settings?.theme === 'dark') value = darkTheme
    else if (settings?.theme === 'light') value = lightTheme
    return value
  }, [isDark, settings?.theme, settings?.color])

  const settingsContext = useMemo(
    () => ({settings, setSettings}),
    [settings, setSettings],
  )

  const action = useMemo(
    () => ({
      label: 'Close',
      onPress: () => setSnackbar(''),
      color: theme.colors.primary,
    }),
    [theme.colors.primary],
  )

  return (
    <PaperProvider
      theme={theme}
      settings={{icon: props => <MaterialIcon {...props} />}}>
      <NavigationContainer theme={theme}>
        {initialized && (
          <SettingsContext.Provider value={settingsContext}>
            <Routes />
          </SettingsContext.Provider>
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
