import React, {useEffect, useState} from 'react';
import {useColorScheme} from 'react-native';
import {IconButton} from 'react-native-paper';
import {SQLiteDatabase} from 'react-native-sqlite-storage';
import {Drawer, DrawerParamList} from './App';
import BestPage from './BestPage';
import {
  addHidden,
  addImage,
  addNotify,
  addSound,
  createPlans,
  createSets,
  createSettings,
  createWorkouts,
  getDb,
} from './db';
import HomePage from './HomePage';
import PlanPage from './PlanPage';
import SettingsPage from './SettingsPage';
import WorkoutsPage from './WorkoutsPage';

interface Route {
  name: keyof DrawerParamList;
  component: React.ComponentType<any>;
  icon: string;
}

export const DatabaseContext = React.createContext<SQLiteDatabase>(null as any);

export default function Routes() {
  const [db, setDb] = useState<SQLiteDatabase | null>(null);
  const dark = useColorScheme() === 'dark';

  useEffect(() => {
    getDb().then(setDb);
  }, []);

  if (!db) return null;

  const routes: Route[] = [
    {name: 'Home', component: HomePage, icon: 'home'},
    {name: 'Plans', component: PlanPage, icon: 'calendar'},
    {name: 'Best', component: BestPage, icon: 'stats-chart'},
    {name: 'Workouts', component: WorkoutsPage, icon: 'barbell'},
    {name: 'Settings', component: SettingsPage, icon: 'settings'},
  ];

  return (
    <DatabaseContext.Provider value={db}>
      <Drawer.Navigator
        screenOptions={{
          headerTintColor: dark ? 'white' : 'black',
          swipeEdgeWidth: 1000,
        }}>
        {routes.map(route => (
          <Drawer.Screen
            key={route.name}
            name={route.name}
            component={route.component}
            options={{
              drawerIcon: ({focused}) => (
                <IconButton
                  icon={focused ? route.icon : `${route.icon}-outline`}
                />
              ),
            }}
          />
        ))}
      </Drawer.Navigator>
    </DatabaseContext.Provider>
  );
}
