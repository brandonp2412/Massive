import { createStackNavigator } from "@react-navigation/stack";
import EditExercise from "./EditExercise";
import EditExercises from "./EditExercises";
import GymSet from "./gym-set";
import ExerciseList from "./ExerciseList";

export type ExercisesPageParams = {
  ExerciseList: {
    clearNames?: boolean;
    search?: string;
    update?: GymSet;
    reset?: number;
  };
  EditExercise: {
    gymSet: GymSet;
  };
  EditExercises: {
    names: string[];
  };
};

const Stack = createStackNavigator<ExercisesPageParams>();

export default function ExercisesPage() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, animationEnabled: false }}
    >
      <Stack.Screen name="ExerciseList" component={ExerciseList} />
      <Stack.Screen name="EditExercise" component={EditExercise} />
      <Stack.Screen name="EditExercises" component={EditExercises} />
    </Stack.Navigator>
  );
}
