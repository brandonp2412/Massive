import { createDrawerNavigator } from "@react-navigation/drawer";
import { StackScreenProps } from "@react-navigation/stack";
import { IconButton, useTheme, Banner } from "react-native-paper";
import { DrawerParams } from "./drawer-params";
import ExerciseList from "./ExerciseList";
import GraphsList from "./GraphList";
import InsightsPage from "./InsightsPage";
import PlanList from "./PlanList";
import SetList from "./SetList";
import SettingsPage from "./SettingsPage";
import WeightList from "./WeightList";
import Daily from "./Daily";

const Drawer = createDrawerNavigator<DrawerParams>();

interface AppDrawerParams {
  startup: string;
}

export default function AppDrawer({
  route,
}: StackScreenProps<{ startup: AppDrawerParams }>) {
  const { dark } = useTheme();

  return (
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
        name="Daily"
        component={Daily}
        options={{ drawerIcon: () => <IconButton icon="calendar-outline" /> }}
      />
      <Drawer.Screen
        name="Plans"
        component={PlanList}
        options={{ drawerIcon: () => <IconButton icon="checkbox-multiple-marked-outline" /> }}
      />
      <Drawer.Screen
        name="Graphs"
        component={GraphsList}
        options={{
          drawerIcon: () => <IconButton icon="chart-bell-curve-cumulative" />,
        }}
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