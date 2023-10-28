import { createDrawerNavigator } from "@react-navigation/drawer";
import { IconButton } from "react-native-paper";
import GraphsList from "./GraphsList";
import InsightsPage from "./InsightsPage";
import PlanList from "./PlanList";
import SetList from "./SetList";
import SettingsPage from "./SettingsPage";
import TimerPage from "./TimerPage";
import WeightList from "./WeightList";
import WorkoutList from "./WorkoutList";
import { DrawerParams } from "./drawer-param-list";
import useDark from "./use-dark";

const Drawer = createDrawerNavigator<DrawerParams>();

export default function AppDrawer() {
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
        component={SetList}
        options={{ drawerIcon: () => <IconButton icon="home-outline" /> }}
      />
      <Drawer.Screen
        name="Plans"
        component={PlanList}
        options={{ drawerIcon: () => <IconButton icon="calendar-outline" /> }}
      />
      <Drawer.Screen
        name="Graphs"
        component={GraphsList}
        options={{
          drawerIcon: () => <IconButton icon="chart-bell-curve-cumulative" />,
        }}
      />
      <Drawer.Screen
        name="Workouts"
        component={WorkoutList}
        options={{ drawerIcon: () => <IconButton icon="dumbbell" /> }}
      />
      <Drawer.Screen
        name="Timer"
        component={TimerPage}
        options={{ drawerIcon: () => <IconButton icon="timer-outline" /> }}
      />
      <Drawer.Screen
        name="Weight"
        component={WeightList}
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
