import {DrawerNavigationProp} from '@react-navigation/drawer'
import {useNavigation} from '@react-navigation/native'
import {Appbar, IconButton} from 'react-native-paper'
import {DrawerParamList} from './drawer-param-list'
import DrawerMenu from './DrawerMenu'
import useDark from './use-dark'

export default function DrawerHeader({name}: {name: keyof DrawerParamList}) {
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>()
  const dark = useDark()

  return (
    <Appbar.Header>
      <IconButton
        color={dark ? 'white' : 'white'}
        icon="menu"
        onPress={navigation.openDrawer}
      />
      <Appbar.Content title={name} />
      <DrawerMenu name={name} />
    </Appbar.Header>
  )
}
