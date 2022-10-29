import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import {Provider as PaperProvider} from 'react-native-paper';
import {Color} from './color';
import {lightColors} from './colors';
import MassiveSnack from './MassiveSnack';
import {defaultSettings, SettingsContext} from './use-settings';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

const color = lightColors[0].hex;
export const setColor = jest.fn();
const settings = defaultSettings;
export const setSettings = jest.fn();

export const MockProviders = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => (
  <Color.Provider value={{color, setColor}}>
    <PaperProvider settings={{icon: props => <MaterialIcon {...props} />}}>
      <SettingsContext.Provider value={{settings, setSettings}}>
        <MassiveSnack>
          <NavigationContainer>{children}</NavigationContainer>
        </MassiveSnack>
      </SettingsContext.Provider>
    </PaperProvider>
  </Color.Provider>
);
