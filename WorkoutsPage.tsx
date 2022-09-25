import {DrawerNavigationProp} from '@react-navigation/drawer';
import {useNavigation} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import {IconButton} from 'react-native-paper';
import {DrawerParamList} from './drawer-param-list';
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
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();

  return (
    <Stack.Navigator
      screenOptions={{headerShown: false, animationEnabled: false}}>
      <Stack.Screen name="WorkoutList" component={WorkoutList} />
      <Stack.Screen
        name="EditWorkout"
        component={EditWorkout}
        listeners={{
          beforeRemove: () => {
            navigation.setOptions({
              headerLeft: () => (
                <IconButton icon="menu" onPress={navigation.openDrawer} />
              ),
              title: 'Workouts',
            });
          },
        }}
      />
    </Stack.Navigator>
  );
}
