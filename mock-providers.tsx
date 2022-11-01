import {NavigationContainer} from '@react-navigation/native'
import React from 'react'
import {DefaultTheme, Provider as PaperProvider} from 'react-native-paper'
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'
import {ThemeContext} from './use-theme'

export const theme = {
  theme: 'system',
  setTheme: jest.fn(),
  color: DefaultTheme.colors.primary,
  setColor: jest.fn(),
}

export const MockProviders = ({
  children,
}: {
  children: JSX.Element | JSX.Element[]
}) => (
  <PaperProvider settings={{icon: props => <MaterialIcon {...props} />}}>
    <ThemeContext.Provider value={theme}>
      <NavigationContainer>{children}</NavigationContainer>
    </ThemeContext.Provider>
  </PaperProvider>
)
