import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  NavigationContainer,
} from '@react-navigation/native'
import {useEffect, useMemo, useState} from 'react'
import {useColorScheme} from 'react-native'
import {
  DarkTheme as PaperDarkTheme,
  DefaultTheme as PaperDefaultTheme,
  Provider as PaperProvider,
} from 'react-native-paper'
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'
import {Color} from './color'
import {lightColors} from './colors'
import {AppDataSource} from './data-source'
import {settingsRepo} from './db'
import MassiveSnack from './MassiveSnack'
import Routes from './Routes'
import Settings from './settings'
import {SettingsContext} from './use-settings'

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
  const [settings, setSettings] = useState<Settings>()
  const [color, setColor] = useState(
    isDark
      ? CombinedDarkTheme.colors.primary.toUpperCase()
      : CombinedDefaultTheme.colors.primary.toUpperCase(),
  )

  useEffect(() => {
    AppDataSource.initialize().then(async () => {
      const gotSettings = await settingsRepo.findOne({where: {}})
      console.log(`${App.name}.useEffect:`, {gotSettings})
      setSettings(gotSettings)
      if (gotSettings.color) setColor(gotSettings.color)
    })
  }, [setColor])

  const theme = useMemo(() => {
    const darkTheme = {
      ...CombinedDarkTheme,
      colors: {...CombinedDarkTheme.colors, primary: color},
    }
    const lightTheme = {
      ...CombinedDefaultTheme,
      colors: {...CombinedDefaultTheme.colors, primary: color},
    }
    let value = isDark ? darkTheme : lightTheme
    if (settings?.theme === 'dark') value = darkTheme
    else if (settings?.theme === 'light') value = lightTheme
    return value
  }, [color, isDark, settings])

  return (
    <Color.Provider value={{color, setColor}}>
      <PaperProvider
        theme={theme}
        settings={{icon: props => <MaterialIcon {...props} />}}>
        <NavigationContainer theme={theme}>
          <MassiveSnack>
            {settings && (
              <SettingsContext.Provider value={{settings, setSettings}}>
                <Routes />
              </SettingsContext.Provider>
            )}
          </MassiveSnack>
        </NavigationContainer>
      </PaperProvider>
    </Color.Provider>
  )
}

export default App
