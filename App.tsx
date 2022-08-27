import {createDrawerNavigator} from '@react-navigation/drawer';
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {useColorScheme} from 'react-native';
import {
  DarkTheme as PaperDarkTheme,
  DefaultTheme as PaperDefaultTheme,
  Provider,
  Snackbar,
} from 'react-native-paper';
import {SQLiteDatabase} from 'react-native-sqlite-storage';
import Ionicon from 'react-native-vector-icons/Ionicons';
import {
  addHidden,
  addSound,
  createPlans,
  createSets,
  createSettings,
  createWorkouts,
  getDb,
} from './db';
import Routes from './Routes';

export const Drawer = createDrawerNavigator<DrawerParamList>();
export type DrawerParamList = {
  Home: {};
  Settings: {};
  Best: {};
  Plans: {};
  Workouts: {};
};

export const DatabaseContext = React.createContext<SQLiteDatabase>({} as any);
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
  const [db, setDb] = useState<SQLiteDatabase | null>(null);
  const [snackbar, setSnackbar] = useState('');
  const dark = useColorScheme() === 'dark';

  useEffect(() => {
    const init = async () => {
      const _db = await getDb();
      await _db.executeSql(createPlans);
      await _db.executeSql(createSets);
      await _db.executeSql(createSettings);
      await _db.executeSql(addSound).catch(() => null);
      await _db.executeSql(createWorkouts);
      await _db.executeSql(addHidden).catch(() => null);
      const [result] = await _db.executeSql(`SELECT * FROM settings LIMIT 1`);
      if (result.rows.length === 0)
        return _db.executeSql(`
            INSERT INTO settings(minutes,seconds,alarm,vibrate,predict,sets) 
            VALUES(3,30,false,true,true,3);
          `);
      setDb(_db);
    };
    init();
  }, []);

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
          <Routes db={db} />
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
