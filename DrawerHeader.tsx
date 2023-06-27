import { DrawerNavigationProp } from '@react-navigation/drawer'
import { useNavigation } from '@react-navigation/native'
import { Appbar, IconButton } from 'react-native-paper'
import { DrawerParamList } from './drawer-param-list'
import useDark from './use-dark'

export default function DrawerHeader({
  name,
  children,
}: {
  name: string
  children?: JSX.Element | JSX.Element[]
}) {
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>()
  const dark = useDark()

  return (
    <Appbar.Header>
      <IconButton
        color={dark ? 'white' : 'white'}
        icon='menu'
        onPress={navigation.openDrawer}
      />
      <Appbar.Content title={name} />
      {children}
    </Appbar.Header>
  )
}
