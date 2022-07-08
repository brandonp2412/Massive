import {useAsyncStorage} from '@react-native-async-storage/async-storage';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {StatusBar, useColorScheme} from 'react-native';
import {
  DarkTheme as DarkThemePaper,
  DefaultTheme as DefaultThemePaper,
  Provider,
} from 'react-native-paper';
import {SQLiteDatabase} from 'react-native-sqlite-storage';
import Ionicon from 'react-native-vector-icons/Ionicons';
import {createPlans, createSets, getDb} from './db';
import BestPage from './BestPage';
import HomePage from './HomePage';
import PlanPage from './PlanPage';
import SettingsPage from './SettingsPage';

const Tab = createMaterialTopTabNavigator<RootStackParamList>();
export type RootStackParamList = {
  Home: {};
  Settings: {};
  Best: {};
  Plan: {};
};

export const DatabaseContext = React.createContext<SQLiteDatabase>({} as any);

const App = () => {
  const [db, setDb] = useState<SQLiteDatabase | null>(null);
  const dark = useColorScheme() === 'dark';
  const {getItem: getMinutes, setItem: setMinutes} = useAsyncStorage('minutes');
  const {getItem: getSeconds, setItem: setSeconds} = useAsyncStorage('seconds');
  const {getItem: getAlarmEnabled, setItem: setAlarmEnabled} =
    useAsyncStorage('alarmEnabled');

  const init = async () => {
    const gotDb = await getDb();
    await gotDb.executeSql(createPlans);
    await gotDb.executeSql(createSets);
    setDb(gotDb);
    const minutes = await getMinutes();
    if (minutes === null) await setMinutes('3');
    const seconds = await getSeconds();
    if (seconds === null) await setSeconds('30');
    const alarmEnabled = await getAlarmEnabled();
    if (alarmEnabled === null) await setAlarmEnabled('false');
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <Provider
      theme={dark ? DarkThemePaper : DefaultThemePaper}
      settings={{icon: props => <Ionicon {...props} />}}>
      <NavigationContainer theme={dark ? DarkTheme : DefaultTheme}>
        <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
        {db && (
          <DatabaseContext.Provider value={db}>
            <Tab.Navigator>
              <Tab.Screen name="Home" component={HomePage} />
              <Tab.Screen name="Plan" component={PlanPage} />
              <Tab.Screen name="Best" component={BestPage} />
              <Tab.Screen name="Settings" component={SettingsPage} />
            </Tab.Navigator>
          </DatabaseContext.Provider>
        )}
      </NavigationContainer>
    </Provider>
  );
};

export default App;
