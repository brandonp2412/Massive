import AsyncStorage from '@react-native-async-storage/async-storage';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
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
import Settings from './Settings';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator<RootStackParamList>();
export type RootStackParamList = {
  Home: {};
  Exercises: {};
  Settings: {};
  Alarm: {};
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
      <Tab.Navigator
        screenOptions={({route}) => ({
          tabBarIcon: ({focused, color, size}) => {
            let icon = '';

            if (route.name === 'Home') icon = focused ? 'home' : 'home-outline';
            else if (route.name === 'Settings')
              icon = focused ? 'settings' : 'settings-outline';
            else if (route.name === 'Exercises')
              icon = focused ? 'barbell' : 'barbell-outline';
            // You can return any component that you like here!
            return <Ionicons name={icon} size={size} color={color} />;
          },
          tabBarActiveTintColor: 'tomato',
          tabBarInactiveTintColor: 'gray',
        })}>
        <Tab.Screen name="Home" component={Home} />
        <Tab.Screen name="Exercises" component={Exercises} />
        <Tab.Screen name="Settings" component={Settings} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;
