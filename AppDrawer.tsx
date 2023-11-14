import { createDrawerNavigator } from "@react-navigation/drawer";
import { StackScreenProps } from "@react-navigation/stack";
import { IconButton, useTheme } from "react-native-paper";
import ExerciseList from "./ExerciseList";
import GraphsList from "./GraphsList";
import InsightsPage from "./InsightsPage";
import PlanList from "./PlanList";
import SetList from "./SetList";
import SettingsPage from "./SettingsPage";
import TimerPage from "./TimerPage";
import TimerProgress from "./TimerProgress";
import WeightList from "./WeightList";
import { DrawerParams } from "./drawer-param-list";

const Drawer = createDrawerNavigator<DrawerParams>();

interface AppDrawerParams {
  startup: string;
}

export default function AppDrawer({
  route,
}: StackScreenProps<{ startup: AppDrawerParams }>) {
  const { dark } = useTheme();

  return (
    <>
      <Drawer.Navigator
        screenOptions={{
          headerTintColor: dark ? "white" : "black",
          swipeEdgeWidth: 1000,
          headerShown: false,
        }}
        initialRouteName={
          (route.params.startup as keyof DrawerParams) || "History"
        }
      >
        <Drawer.Screen
          name="History"
          component={SetList}
          options={{ drawerIcon: () => <IconButton icon="history" /> }}
        />
        <Drawer.Screen
          name="Exercises"
          component={ExerciseList}
          options={{ drawerIcon: () => <IconButton icon="dumbbell" /> }}
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
      <TimerProgress />
    </>
  );
}
