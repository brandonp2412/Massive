import {DrawerNavigationProp} from '@react-navigation/drawer';
import {useNavigation} from '@react-navigation/native';
import {Appbar, IconButton} from 'react-native-paper';
import {DrawerParamList} from './drawer-param-list';
import DrawerMenu from './DrawerMenu';

export default function DrawerHeader({name}: {name: keyof DrawerParamList}) {
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();

  return (
    <Appbar.Header>
      <IconButton icon="menu" onPress={navigation.openDrawer} />
      <Appbar.Content title={name} />
      <DrawerMenu name={name} />
    </Appbar.Header>
  );
}
