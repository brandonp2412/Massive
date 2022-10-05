import {DrawerNavigationProp} from '@react-navigation/drawer';
import {useNavigation} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import {IconButton} from 'react-native-paper';
import {DrawerParamList} from './drawer-param-list';
import {SessionPageParams} from './session-page-params';
import SessionList from './SessionList';
import StartSession from './StartSession';

const Stack = createStackNavigator<SessionPageParams>();

export default function SessionPage() {
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();

  return (
    <Stack.Navigator
      screenOptions={{headerShown: false, animationEnabled: false}}>
      <Stack.Screen name="SessionList" component={SessionList} />
      <Stack.Screen
        name="StartSession"
        component={StartSession}
        listeners={{
          beforeRemove: () => {
            navigation.setOptions({
              headerLeft: () => (
                <IconButton icon="menu" onPress={navigation.openDrawer} />
              ),
              title: 'Session',
            });
          },
        }}
      />
    </Stack.Navigator>
  );
}
