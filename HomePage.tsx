import {DrawerNavigationProp} from '@react-navigation/drawer';
import {useNavigation} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import {IconButton} from 'react-native-paper';
import {DrawerParamList} from './drawer-param-list';
import EditSet from './EditSet';
import {HomePageParams} from './home-page-params';
import SetList from './SetList';

const Stack = createStackNavigator<HomePageParams>();

export default function HomePage() {
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();

  return (
    <Stack.Navigator
      screenOptions={{headerShown: false, animationEnabled: false}}>
      <Stack.Screen name="Sets" component={SetList} />
      <Stack.Screen
        name="EditSet"
        component={EditSet}
        listeners={{
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
