import {DrawerNavigationProp} from '@react-navigation/drawer';
import {useNavigation} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import {IconButton} from 'react-native-paper';
import {DrawerParamList} from './App';
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
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();

  return (
    <Stack.Navigator
      screenOptions={{headerShown: false, animationEnabled: false}}>
      <Stack.Screen name="BestList" component={BestList} />
      <Stack.Screen
        name="ViewBest"
        component={ViewBest}
        listeners={{
          beforeRemove: () => {
            navigation.setOptions({
              headerLeft: () => (
                <IconButton icon="menu" onPress={navigation.openDrawer} />
              ),
              title: 'Best',
            });
          },
        }}
      />
    </Stack.Navigator>
  );
}
