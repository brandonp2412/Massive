import {NavigationProp, useNavigation} from '@react-navigation/native'
import {useCallback, useState} from 'react'
import {IconButton, Menu} from 'react-native-paper'
import ConfirmDialog from './ConfirmDialog'
import {planRepo, setRepo} from './db'
import {DrawerParamList} from './drawer-param-list'
import {toast} from './toast'
import useDark from './use-dark'

export default function DrawerMenu({name}: {name: keyof DrawerParamList}) {
  const [showMenu, setShowMenu] = useState(false)
  const [showRemove, setShowRemove] = useState(false)
  const {reset} = useNavigation<NavigationProp<DrawerParamList>>()
  const dark = useDark()

  const remove = useCallback(async () => {
    setShowMenu(false)
    setShowRemove(false)
    if (name === 'Home') await setRepo.delete({})
    else if (name === 'Plans') await planRepo.delete({})
    toast('All data has been deleted.')
    reset({index: 0, routes: [{name}]})
  }, [reset, name])

  if (name === 'Home' || name === 'Plans')
    return (
      <Menu
        visible={showMenu}
        onDismiss={() => setShowMenu(false)}
        anchor={
          <IconButton
            color={dark ? 'white' : 'white'}
            onPress={() => setShowMenu(true)}
            icon="more-vert"
          />
        }>
        <Menu.Item
          icon="delete"
          onPress={() => setShowRemove(true)}
          title="Delete"
        />
        <ConfirmDialog
          title="Delete all data"
          show={showRemove}
          setShow={setShowRemove}
          onOk={remove}>
          This irreversibly deletes all data from the app. Are you sure?
        </ConfirmDialog>
      </Menu>
    )

  return null
}
