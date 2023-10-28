import { createStackNavigator } from "@react-navigation/stack";
import AppDrawer from "./AppDrawer";
import EditPlan from "./EditPlan";
import EditSet from "./EditSet";
import EditSets from "./EditSets";
import EditWeight from "./EditWeight";
import EditWorkout from "./EditWorkout";
import EditWorkouts from "./EditWorkouts";
import StartPlan from "./StartPlan";
import ViewGraph from "./ViewGraph";
import ViewWeightGraph from "./ViewWeightGraph";
import GymSet from "./gym-set";
import { Plan } from "./plan";
import Weight from "./weight";

export type StackParams = {
  Drawer: {};
  EditSet: {
    set: GymSet;
  };
  EditSets: {
    ids: number[];
  };
  EditPlan: {
    plan: Plan;
  };
  StartPlan: {
    plan: Plan;
    first?: GymSet;
  };
  ViewGraph: {
    name: string;
  };
  EditWeight: {
    weight: Weight;
  };
  ViewWeightGraph: {};
  EditWorkout: {
    gymSet: GymSet;
  };
  EditWorkouts: {
    names: string[];
  };
};

const Stack = createStackNavigator<StackParams>();

export default function AppStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, animationEnabled: false }}
    >
      <Stack.Screen name="Drawer" component={AppDrawer} />
      <Stack.Screen name="EditSet" component={EditSet} />
      <Stack.Screen name="EditSets" component={EditSets} />
      <Stack.Screen name="EditPlan" component={EditPlan} />
      <Stack.Screen name="StartPlan" component={StartPlan} />
      <Stack.Screen name="ViewGraph" component={ViewGraph} />
      <Stack.Screen name="EditWeight" component={EditWeight} />
      <Stack.Screen name="ViewWeightGraph" component={ViewWeightGraph} />
      <Stack.Screen name="EditWorkout" component={EditWorkout} />
      <Stack.Screen name="EditWorkouts" component={EditWorkouts} />
    </Stack.Navigator>
  );
}
