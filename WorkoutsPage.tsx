import {createStackNavigator} from '@react-navigation/stack';
import EditWorkout from './EditWorkout';
import GymSet from './gym-set';
import WorkoutList from './WorkoutList';

export type WorkoutsPageParams = {
  WorkoutList: {};
  EditWorkout: {
    value: GymSet;
  };
};

const Stack = createStackNavigator<WorkoutsPageParams>();

export default function WorkoutsPage() {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false, animationEnabled: false}}>
      <Stack.Screen name="WorkoutList" component={WorkoutList} />
      <Stack.Screen name="EditWorkout" component={EditWorkout} />
    </Stack.Navigator>
  );
}
