import {createDrawerNavigator} from '@react-navigation/drawer';
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import React, {useState} from 'react';
import {useColorScheme} from 'react-native';
import {
  DarkTheme as PaperDarkTheme,
  DefaultTheme as PaperDefaultTheme,
  Provider,
  Snackbar,
} from 'react-native-paper';
import Ionicon from 'react-native-vector-icons/Ionicons';
import Routes from './Routes';

export const Drawer = createDrawerNavigator<DrawerParamList>();
export type DrawerParamList = {
  Home: {};
  Settings: {};
  Best: {};
  Plans: {};
  Workouts: {};
  Loading: {};
};

export const SnackbarContext = React.createContext<{
  toast: (value: string, timeout: number) => void;
}>({toast: () => null});

export const CombinedDefaultTheme = {
  ...PaperDefaultTheme,
  ...NavigationDefaultTheme,
  colors: {
    ...PaperDefaultTheme.colors,
    ...NavigationDefaultTheme.colors,
  },
};
export const CombinedDarkTheme = {
  ...PaperDarkTheme,
  ...NavigationDarkTheme,
  colors: {
    ...PaperDarkTheme.colors,
    ...NavigationDarkTheme.colors,
    primary: '#B3E5fC',
    background: '#0e0e0e',
  },
};

const App = () => {
  const [snackbar, setSnackbar] = useState('');
  const dark = useColorScheme() === 'dark';

  const toast = (value: string, timeout: number) => {
    setSnackbar(value);
    setTimeout(() => setSnackbar(''), timeout);
  };

  return (
    <Provider
      theme={dark ? CombinedDarkTheme : CombinedDefaultTheme}
      settings={{icon: props => <Ionicon {...props} />}}>
      <NavigationContainer
        theme={dark ? CombinedDarkTheme : CombinedDefaultTheme}>
        <SnackbarContext.Provider value={{toast}}>
          <Routes />
        </SnackbarContext.Provider>
      </NavigationContainer>
      <Snackbar
        onDismiss={() => setSnackbar('')}
        visible={!!snackbar}
        action={{
          label: 'Close',
          onPress: () => setSnackbar(''),
          color: dark
            ? CombinedDarkTheme.colors.background
            : CombinedDefaultTheme.colors.primary,
        }}>
        {snackbar}
      </Snackbar>
    </Provider>
  );
};

export default App;
