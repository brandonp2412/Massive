import AsyncStorage from '@react-native-async-storage/async-storage';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {StatusBar, useColorScheme} from 'react-native';
import {
  DarkTheme as PaperDarkTheme,
  DefaultTheme as PaperDefaultTheme,
  Provider,
} from 'react-native-paper';
import {SQLiteDatabase} from 'react-native-sqlite-storage';
import Ionicon from 'react-native-vector-icons/Ionicons';
import {createPlans, createSets, getDb} from './db';
import Routes from './Routes';

export const Drawer = createDrawerNavigator<DrawerParamList>();
export type DrawerParamList = {
  Home: {};
  Settings: {};
  Best: {};
  Plans: {};
};

export const DatabaseContext = React.createContext<SQLiteDatabase>({} as any);

const {getItem, setItem} = AsyncStorage;

const CombinedDefaultTheme = {
  ...PaperDefaultTheme,
  ...NavigationDefaultTheme,
  colors: {
    ...PaperDefaultTheme.colors,
    ...NavigationDefaultTheme.colors,
  },
};
const CombinedDarkTheme = {
  ...PaperDarkTheme,
  ...NavigationDarkTheme,
  colors: {
    ...PaperDarkTheme.colors,
    ...NavigationDarkTheme.colors,
  },
};

const App = () => {
  const [db, setDb] = useState<SQLiteDatabase | null>(null);
  const dark = useColorScheme() === 'dark';

  useEffect(() => {
    const init = async () => {
      const gotDb = await getDb();
      await gotDb.executeSql(createPlans);
      await gotDb.executeSql(createSets);
      setDb(gotDb);
      const minutes = await getItem('minutes');
      if (minutes === null) await setItem('minutes', '3');
      const seconds = await getItem('seconds');
      if (seconds === null) await setItem('seconds', '30');
      const alarmEnabled = await getItem('alarmEnabled');
      if (alarmEnabled === null) await setItem('alarmEnabled', 'false');
      if (!(await getItem('predictiveSets')))
        await setItem('predictiveSets', 'true');
      if (!(await getItem('maxSets'))) await setItem('maxSets', '3');
    };
    init();
  }, []);

  return (
    <Provider
      theme={dark ? CombinedDarkTheme : CombinedDefaultTheme}
      settings={{icon: props => <Ionicon {...props} />}}>
      <NavigationContainer
        theme={dark ? CombinedDarkTheme : CombinedDefaultTheme}>
        <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
        <Routes db={db} />
      </NavigationContainer>
    </Provider>
  );
};

export default App;
