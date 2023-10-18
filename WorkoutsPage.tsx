import { createStackNavigator } from "@react-navigation/stack";
import EditWorkout from "./EditWorkout";
import EditWorkouts from "./EditWorkouts";
import GymSet from "./gym-set";
import WorkoutList from "./WorkoutList";

export type WorkoutsPageParams = {
  WorkoutList: {
    clearNames?: boolean;
    search?: string;
    update?: GymSet;
    reset?: number;
  };
  EditWorkout: {
    gymSet: GymSet;
  };
  EditWorkouts: {
    names: string[];
  };
};

const Stack = createStackNavigator<WorkoutsPageParams>();

export default function WorkoutsPage() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, animationEnabled: false }}
    >
      <Stack.Screen name="WorkoutList" component={WorkoutList} />
      <Stack.Screen name="EditWorkout" component={EditWorkout} />
      <Stack.Screen name="EditWorkouts" component={EditWorkouts} />
    </Stack.Navigator>
  );
}
