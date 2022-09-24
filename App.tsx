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
} from 'react-native-paper';
import Ionicon from 'react-native-vector-icons/Ionicons';
import MassiveSnack from './MassiveSnack';
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

export const CustomTheme = React.createContext({
  color: '',
  setColor: (_value: string) => {},
});

const App = () => {
  const dark = useColorScheme() === 'dark';
  const [color, setColor] = useState(
    dark
      ? CombinedDarkTheme.colors.primary
      : CombinedDefaultTheme.colors.primary,
  );
  const theme = dark
    ? {
        ...CombinedDarkTheme,
        colors: {...CombinedDarkTheme.colors, primary: color},
      }
    : {
        ...CombinedDefaultTheme,
        colors: {...CombinedDefaultTheme.colors, primary: color},
      };

  return (
    <CustomTheme.Provider value={{color, setColor}}>
      <Provider
        theme={theme}
        settings={{icon: props => <Ionicon {...props} />}}>
        <NavigationContainer theme={theme}>
          <MassiveSnack>
            <Routes />
          </MassiveSnack>
        </NavigationContainer>
      </Provider>
    </CustomTheme.Provider>
  );
};

export default App;
