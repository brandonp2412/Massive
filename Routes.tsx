import {createDrawerNavigator} from '@react-navigation/drawer';
import React, {useContext, useEffect, useState} from 'react';
import {useColorScheme} from 'react-native';
import {IconButton} from 'react-native-paper';
import {CustomTheme} from './App';
import BestPage from './BestPage';
import {runMigrations} from './db';
import {DrawerParamList} from './drawer-param-list';
import HomePage from './HomePage';
import PlanPage from './PlanPage';
import Route from './route';
import {getSettings, settings} from './settings.service';
import SettingsPage from './SettingsPage';
import WorkoutsPage from './WorkoutsPage';

const Drawer = createDrawerNavigator<DrawerParamList>();

export default function Routes() {
  const [migrated, setMigrated] = useState(false);
  const dark = useColorScheme() === 'dark';
  const {setColor} = useContext(CustomTheme);

  useEffect(() => {
    runMigrations()
      .then(getSettings)
      .then(() => {
        setMigrated(true);
        if (settings.color) setColor(settings.color);
      });
  }, [setColor]);

  if (!migrated) return null;

  const routes: Route[] = [
    {name: 'Home', component: HomePage, icon: 'home'},
    {name: 'Plans', component: PlanPage, icon: 'calendar'},
    {name: 'Best', component: BestPage, icon: 'stats-chart'},
    {name: 'Workouts', component: WorkoutsPage, icon: 'barbell'},
    {name: 'Settings', component: SettingsPage, icon: 'settings'},
  ];

  return (
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
  );
}
