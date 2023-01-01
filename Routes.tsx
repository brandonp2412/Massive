import {createDrawerNavigator} from '@react-navigation/drawer'
import {useMemo} from 'react'
import {IconButton} from 'react-native-paper'
import BestPage from './BestPage'
import {DrawerParamList} from './drawer-param-list'
import HomePage from './HomePage'
import PlanPage from './PlanPage'
import Route from './route'
import SettingsPage from './SettingsPage'
import TimerPage from './TimerPage'
import useDark from './use-dark'
import WorkoutsPage from './WorkoutsPage'

const Drawer = createDrawerNavigator<DrawerParamList>()

export default function Routes() {
  const dark = useDark()

  const routes: Route[] = useMemo(
    () => [
      {name: 'Home', component: HomePage, icon: 'home'},
      {name: 'Plans', component: PlanPage, icon: 'event'},
      {name: 'Best', component: BestPage, icon: 'insights'},
      {name: 'Workouts', component: WorkoutsPage, icon: 'fitness-center'},
      {name: 'Timer', component: TimerPage, icon: 'access-time'},
      {name: 'Settings', component: SettingsPage, icon: 'settings'},
    ],
    [],
  )

  return (
    <Drawer.Navigator
      screenOptions={{
        headerTintColor: dark ? 'white' : 'black',
        swipeEdgeWidth: 1000,
        headerShown: false,
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
  )
}
