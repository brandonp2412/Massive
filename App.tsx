import AsyncStorage from '@react-native-async-storage/async-storage';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {StatusBar, useColorScheme} from 'react-native';
import {setupSchema} from './db';
import Exercises from './Exercises';
import Home from './Home';
import Plans from './Plans';
import Settings from './Settings';

const Tab = createMaterialTopTabNavigator<RootStackParamList>();
export type RootStackParamList = {
  Home: {};
  Settings: {};
  Exercises: {};
  Plans: {};
};

setupSchema();

const App = () => {
  const dark = useColorScheme() === 'dark';

  useEffect(() => {
    AsyncStorage.getItem('minutes').then(async minutes => {
      if (!minutes) await AsyncStorage.setItem('minutes', '3');
    });
  }, []);

  return (
    <NavigationContainer theme={dark ? DarkTheme : DefaultTheme}>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
      <Tab.Navigator>
        <Tab.Screen name="Home" component={Home} />
        <Tab.Screen name="Plans" component={Plans} />
        <Tab.Screen name="Exercises" component={Exercises} />
        <Tab.Screen name="Settings" component={Settings} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;
