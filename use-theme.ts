import {createContext, useContext} from 'react'

export const ThemeContext = createContext<{
  theme: string
  color: string
  setTheme: (value: string) => void
  setColor: (value: string) => void
}>({
  theme: 'system',
  color: '',
  setTheme: () => null,
  setColor: () => null,
})

export function useTheme() {
  return useContext(ThemeContext)
}
