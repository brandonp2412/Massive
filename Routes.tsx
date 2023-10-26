import { createDrawerNavigator } from "@react-navigation/drawer";
import { IconButton } from "react-native-paper";
import GraphsPage from "./GraphsPage";
import { DrawerParamList } from "./drawer-param-list";
import HomePage from "./HomePage";
import PlanPage from "./PlanPage";
import SettingsPage from "./SettingsPage";
import TimerPage from "./TimerPage";
import useDark from "./use-dark";
import WorkoutsPage from "./WorkoutsPage";
import WeightPage from "./WeightPage";
import InsightsPage from "./InsightsPage";

const Drawer = createDrawerNavigator<DrawerParamList>();

export default function Routes() {
  const dark = useDark();

  return (
    <Drawer.Navigator
      screenOptions={{
        headerTintColor: dark ? "white" : "black",
        swipeEdgeWidth: 1000,
        headerShown: false,
      }}
    >
      <Drawer.Screen
        name="Home"
        component={HomePage}
        options={{ drawerIcon: () => <IconButton icon="home-outline" /> }}
      />
      <Drawer.Screen
        name="Plans"
        component={PlanPage}
        options={{ drawerIcon: () => <IconButton icon="calendar-outline" /> }}
      />
      <Drawer.Screen
        name="Graphs"
        component={GraphsPage}
        options={{
          drawerIcon: () => <IconButton icon="chart-bell-curve-cumulative" />,
        }}
      />
      <Drawer.Screen
        name="Workouts"
        component={WorkoutsPage}
        options={{ drawerIcon: () => <IconButton icon="dumbbell" /> }}
      />
      <Drawer.Screen
        name="Timer"
        component={TimerPage}
        options={{ drawerIcon: () => <IconButton icon="timer-outline" /> }}
      />
      <Drawer.Screen
        name="Weight"
        component={WeightPage}
        options={{ drawerIcon: () => <IconButton icon="scale-bathroom" /> }}
      />
      <Drawer.Screen
        name="Insights"
        component={InsightsPage}
        options={{
          drawerIcon: () => <IconButton icon="lightbulb-on-outline" />,
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsPage}
        options={{ drawerIcon: () => <IconButton icon="cog-outline" /> }}
      />
    </Drawer.Navigator>
  );
}
