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
import Settings from './settings';
import {getSettings} from './settings.service';
import SettingsPage from './SettingsPage';
import {SettingsContext} from './use-settings';
import WorkoutsPage from './WorkoutsPage';

const Drawer = createDrawerNavigator<DrawerParamList>();

export default function Routes() {
  const [settings, setSettings] = useState<Settings>();
  const dark = useColorScheme() === 'dark';
  const {setColor} = useContext(CustomTheme);

  useEffect(() => {
    runMigrations().then(async () => {
      const gotSettings = await getSettings();
      setSettings(gotSettings);
      if (gotSettings.color) setColor(gotSettings.color);
    });
  }, [setColor]);

  if (!settings) return null;

  const routes: Route[] = [
    {name: 'Home', component: HomePage, icon: 'home'},
    {name: 'Plans', component: PlanPage, icon: 'event'},
    {name: 'Best', component: BestPage, icon: 'insights'},
    {name: 'Workouts', component: WorkoutsPage, icon: 'fitness-center'},
    {name: 'Settings', component: SettingsPage, icon: 'settings'},
  ];

  return (
    <SettingsContext.Provider value={{settings, setSettings}}>
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
              drawerIcon: () => <IconButton icon={route.icon} />,
            }}
          />
        ))}
      </Drawer.Navigator>
    </SettingsContext.Provider>
  );
}
