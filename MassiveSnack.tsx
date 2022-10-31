import {createContext, useContext, useState} from 'react'
import {Snackbar} from 'react-native-paper'
import {CombinedDarkTheme, CombinedDefaultTheme} from './App'
import useDark from './use-dark'

export const SnackbarContext = createContext<{
  toast: (value: string, timeout: number) => void
}>({toast: () => null})

export const useSnackbar = () => {
  return useContext(SnackbarContext)
}

export default function MassiveSnack({
  children,
}: {
  children?: JSX.Element[] | JSX.Element
}) {
  const [snackbar, setSnackbar] = useState('')
  const [timeoutId, setTimeoutId] = useState(0)
  const dark = useDark()

  const toast = (value: string, timeout: number) => {
    setSnackbar(value)
    clearTimeout(timeoutId)
    const id = setTimeout(() => setSnackbar(''), timeout)
    setTimeoutId(id)
  }

  return (
    <>
      <SnackbarContext.Provider value={{toast}}>
        {children}
      </SnackbarContext.Provider>
      <Snackbar
        onDismiss={() => setSnackbar('')}
        visible={!!snackbar}
        action={{
          label: 'Close',
          onPress: () => setSnackbar(''),
          color: dark
            ? CombinedDarkTheme.colors.background
            : CombinedDefaultTheme.colors.background,
        }}>
        {snackbar}
      </Snackbar>
    </>
  )
}
