import { createDrawerNavigator } from '@react-navigation/drawer'
import { IconButton } from 'react-native-paper'
import GraphsPage from './GraphsPage'
import { DrawerParamList } from './drawer-param-list'
import HomePage from './HomePage'
import PlanPage from './PlanPage'
import SettingsPage from './SettingsPage'
import TimerPage from './TimerPage'
import useDark from './use-dark'
import WorkoutsPage from './WorkoutsPage'

const Drawer = createDrawerNavigator<DrawerParamList>()

export default function Routes() {
  const dark = useDark()

  return (
    <Drawer.Navigator
      screenOptions={{
        headerTintColor: dark ? 'white' : 'black',
        swipeEdgeWidth: 1000,
        headerShown: false,
      }}
    >
      <Drawer.Screen
        name='Home'
        component={HomePage}
        options={{ drawerIcon: () => <IconButton icon='home' /> }}
      />
      <Drawer.Screen
        name='Plans'
        component={PlanPage}
        options={{ drawerIcon: () => <IconButton icon='event' /> }}
      />
      <Drawer.Screen
        name='Graphs'
        component={GraphsPage}
        options={{ drawerIcon: () => <IconButton icon='insights' /> }}
      />
      <Drawer.Screen
        name='Workouts'
        component={WorkoutsPage}
        options={{ drawerIcon: () => <IconButton icon='fitness-center' /> }}
      />
      <Drawer.Screen
        name='Timer'
        component={TimerPage}
        options={{ drawerIcon: () => <IconButton icon='access-time' /> }}
      />
      <Drawer.Screen
        name='Food'
        component={TimerPage}
        options={{ drawerIcon: () => <IconButton icon='restaurant' /> }}
      />
      <Drawer.Screen
        name='Settings'
        component={SettingsPage}
        options={{ drawerIcon: () => <IconButton icon='settings' /> }}
      />
    </Drawer.Navigator>
  )
}
