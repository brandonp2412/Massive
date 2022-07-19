import React from 'react';
import {useColorScheme} from 'react-native';
import {IconButton} from 'react-native-paper';
import {SQLiteDatabase} from 'react-native-sqlite-storage';
import {DatabaseContext, Drawer, DrawerParamList} from './App';
import BestPage from './BestPage';
import DrawerMenu from './DrawerMenu';
import HomePage from './HomePage';
import PlanPage from './PlanPage';
import SettingsPage from './SettingsPage';

interface Route {
  name: keyof DrawerParamList;
  component: React.ComponentType<any>;
  icon: string;
}

export default function Routes({db}: {db: SQLiteDatabase | null}) {
  const dark = useColorScheme() === 'dark';

  if (!db) return null;

  const routes: Route[] = [
    {name: 'Home', component: HomePage, icon: 'home'},
    {name: 'Plans', component: PlanPage, icon: 'calendar'},
    {name: 'Best', component: BestPage, icon: 'stats-chart'},
    {name: 'Settings', component: SettingsPage, icon: 'settings'},
  ];

  return (
    <DatabaseContext.Provider value={db}>
      <Drawer.Navigator
        screenOptions={{headerTintColor: dark ? 'white' : 'black'}}>
        {routes.map(route => (
          <Drawer.Screen
            key={route.name}
            name={route.name}
            component={route.component}
            options={{
              headerRight: () => <DrawerMenu name={route.name} />,
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
