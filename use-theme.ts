import { createContext, useContext } from 'react'
import { DarkTheme, DefaultTheme } from 'react-native-paper'

export const ThemeContext = createContext<{
  theme: string
  lightColor: string
  setTheme: (value: string) => void
  setLightColor: (value: string) => void
  darkColor: string
  setDarkColor: (value: string) => void
}>({
  theme: 'system',
  lightColor: DefaultTheme.colors.primary,
  setTheme: () => null,
  setLightColor: () => null,
  darkColor: DarkTheme.colors.primary,
  setDarkColor: () => null,
})

export function useTheme() {
  return useContext(ThemeContext)
}
