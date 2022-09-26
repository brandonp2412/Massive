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
import {lightColors} from './colors';
import MassiveSnack from './MassiveSnack';
import Routes from './Routes';

export const CombinedDefaultTheme = {
  ...NavigationDefaultTheme,
  ...PaperDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    ...PaperDefaultTheme.colors,
  },
};
export const CombinedDarkTheme = {
  ...NavigationDarkTheme,
  ...PaperDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    ...PaperDarkTheme.colors,
    primary: lightColors[0].hex,
    background: '#0E0E0E',
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
      ? CombinedDarkTheme.colors.primary.toUpperCase()
      : CombinedDefaultTheme.colors.primary.toUpperCase(),
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
