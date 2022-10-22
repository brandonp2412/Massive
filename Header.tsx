import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {Appbar, IconButton} from 'react-native-paper';
import {DrawerParamList} from './drawer-param-list';
import DrawerMenu from './DrawerMenu';

export default function Header({name}: {name: keyof DrawerParamList}) {
  const navigation = useNavigation();

  return (
    <Appbar.Header>
      <IconButton icon="menu" onPress={(navigation as any).openDrawer} />
      <Appbar.Content title={name} />
      <DrawerMenu name={name} />
    </Appbar.Header>
  );
}
