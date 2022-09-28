import {createDrawerNavigator} from '@react-navigation/drawer';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import React, {useContext, useEffect, useState} from 'react';
import {useColorScheme} from 'react-native';
import {IconButton} from 'react-native-paper';
import {CustomTheme} from './App';
import BestPage from './BestPage';
import {runMigrations} from './db';
import {DrawerParamList} from './drawer-param-list';
import DrawerMenu from './DrawerMenu';
import EditPlan from './EditPlan';
import EditSet from './EditSet';
import EditWorkout from './EditWorkout';
import HomePage from './HomePage';
import PlanPage from './PlanPage';
import Route from './route';
import {getSettings, settings} from './settings.service';
import SettingsPage from './SettingsPage';
import ViewBest from './ViewBest';
import WorkoutsPage from './WorkoutsPage';

const Drawer = createDrawerNavigator<DrawerParamList>();

export default function Routes() {
  const [migrated, setMigrated] = useState(false);
  const dark = useColorScheme() === 'dark';
  const {setColor} = useContext(CustomTheme);
  const navigation = useNavigation<NavigationProp<DrawerParamList>>();

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
    {name: 'Plans', component: PlanPage, icon: 'event'},
    {name: 'Best', component: BestPage, icon: 'insights'},
    {name: 'Workouts', component: WorkoutsPage, icon: 'fitness-center'},
    {name: 'Settings', component: SettingsPage, icon: 'settings'},
  ];

  const hiddenRoutes: Route[] = [
    {name: 'Edit set', component: EditSet},
    {name: 'Edit plan', component: EditPlan},
    {name: 'Edit workout', component: EditWorkout},
    {name: 'View best', component: ViewBest},
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
            drawerIcon: () => <IconButton icon={route.icon || ''} />,
            headerRight: () => <DrawerMenu name={route.name} />,
          }}
        />
      ))}
      {hiddenRoutes.map(route => (
        <Drawer.Screen
          key={route.name}
          name={route.name}
          component={route.component}
          options={{
            drawerItemStyle: {height: 0},
          }}
        />
      ))}
    </Drawer.Navigator>
  );
}
