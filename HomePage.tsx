import {DrawerNavigationProp} from '@react-navigation/drawer';
import {useNavigation} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import {IconButton} from 'react-native-paper';
import {DrawerParamList} from './App';
import EditSet from './EditSet';
import Set from './set';
import SetsPage from './SetsPage';

const Stack = createStackNavigator<StackParams>();
export type StackParams = {
  Sets: {};
  EditSet: {
    set: Set;
  };
};

export default function HomePage() {
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();

  return (
    <Stack.Navigator
      screenOptions={{headerShown: false, animationEnabled: false}}>
      <Stack.Screen name="Sets" component={SetsPage} />
      <Stack.Screen
        name="EditSet"
        component={EditSet}
        listeners={{
          focus: () => {
            navigation.setOptions({
              headerLeft: () => (
                <IconButton icon="arrow-back" onPress={navigation.goBack} />
              ),
              title: 'Set',
            });
          },
          beforeRemove: () => {
            navigation.setOptions({
              headerLeft: () => (
                <IconButton icon="menu" onPress={navigation.openDrawer} />
              ),
              title: 'Home',
            });
          },
        }}
      />
    </Stack.Navigator>
  );
}
