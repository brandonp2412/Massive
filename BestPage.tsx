import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import BestList from './BestList';
import Set from './set';
import ViewBest from './ViewBest';

const Stack = createStackNavigator<BestPageParams>();
export type BestPageParams = {
  BestList: {};
  ViewBest: {
    best: Set;
  };
};

export default function BestPage() {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false, animationEnabled: false}}>
      <Stack.Screen name="BestList" component={BestList} />
      <Stack.Screen name="ViewBest" component={ViewBest} />
    </Stack.Navigator>
  );
}
