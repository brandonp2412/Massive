import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import EditWorkout from './EditWorkout';
import Set from './set';
import WorkoutList from './WorkoutList';

export type WorkoutsPageParams = {
  WorkoutList: {};
  EditWorkout: {
    value: Set;
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
