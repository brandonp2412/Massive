import {DrawerNavigationProp} from '@react-navigation/drawer';
import {useNavigation} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import {IconButton} from 'react-native-paper';
import {DrawerParamList} from './App';
import EditPlan from './EditPlan';
import {Plan} from './plan';
import PlanList from './PlanList';

const Stack = createStackNavigator<PlanPageParams>();
export type PlanPageParams = {
  PlanList: {};
  EditPlan: {
    plan: Plan;
  };
};

export default function PlanPage() {
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();

  return (
    <Stack.Navigator
      screenOptions={{headerShown: false, animationEnabled: false}}>
      <Stack.Screen name="PlanList" component={PlanList} />
      <Stack.Screen
        name="EditPlan"
        component={EditPlan}
        listeners={{
          beforeRemove: () => {
            navigation.setOptions({
              headerLeft: () => (
                <IconButton icon="menu" onPress={navigation.openDrawer} />
              ),
              title: 'Plans',
            });
          },
        }}
      />
    </Stack.Navigator>
  );
}
