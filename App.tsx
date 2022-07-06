import {useAsyncStorage} from '@react-native-async-storage/async-storage';
import Ionicon from 'react-native-vector-icons/Ionicons';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {StatusBar, useColorScheme} from 'react-native';
import {
  DarkTheme as DarkThemePaper,
  DefaultTheme as DefaultThemePaper,
  Provider,
} from 'react-native-paper';
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
  const {getItem: getMinutes, setItem: setMinutes} = useAsyncStorage('minutes');
  const {getItem: getSeconds, setItem: setSeconds} = useAsyncStorage('seconds');
  const {getItem: getAlarmEnabled, setItem: setAlarmEnabled} =
    useAsyncStorage('alarmEnabled');

  const defaults = async () => {
    const minutes = await getMinutes();
    if (minutes === null) await setMinutes('3');
    const seconds = await getSeconds();
    if (seconds === null) await setSeconds('30');
    const alarmEnabled = await getAlarmEnabled();
    if (alarmEnabled === null) await setAlarmEnabled('false');
  };

  useEffect(() => {
    defaults();
  }, []);

  return (
    <Provider
      theme={dark ? DarkThemePaper : DefaultThemePaper}
      settings={{icon: props => <Ionicon {...props} />}}>
      <NavigationContainer theme={dark ? DarkTheme : DefaultTheme}>
        <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
        <Tab.Navigator>
          <Tab.Screen name="Home" component={Home} />
          <Tab.Screen name="Plans" component={Plans} />
          <Tab.Screen name="Exercises" component={Exercises} />
          <Tab.Screen name="Settings" component={Settings} />
        </Tab.Navigator>
      </NavigationContainer>
    </Provider>
  );
};

export default App;
