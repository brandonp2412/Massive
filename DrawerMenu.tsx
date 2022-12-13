import {NavigationProp, useNavigation} from '@react-navigation/native'
import {useCallback, useState} from 'react'
import {Divider, IconButton, Menu} from 'react-native-paper'
import ConfirmDialog from './ConfirmDialog'
import {planRepo, setRepo} from './db'
import {DrawerParamList} from './drawer-param-list'
import {HomePageParams} from './home-page-params'
import useDark from './use-dark'

export default function DrawerMenu({
  name,
  ids,
}: {
  name: keyof DrawerParamList
  ids: number[]
}) {
  const [showMenu, setShowMenu] = useState(false)
  const [showRemove, setShowRemove] = useState(false)
  const {reset} = useNavigation<NavigationProp<DrawerParamList>>()
  const {navigate} = useNavigation<NavigationProp<HomePageParams>>()
  const dark = useDark()

  const remove = useCallback(async () => {
    setShowMenu(false)
    setShowRemove(false)
    if (name === 'Home') await setRepo.delete(ids.length > 0 ? ids : {})
    else if (name === 'Plans') await planRepo.delete(ids.length > 0 ? ids : {})
    reset({index: 0, routes: [{name}]})
  }, [reset, name, ids])

  const edit = useCallback(() => {
    navigate('EditSets', {ids})
    setShowMenu(false)
  }, [ids, navigate])

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
        {ids.length > 0 && name === 'Home' && (
          <>
            <Menu.Item icon="edit" title="Edit" onPress={edit} />
            <Divider />
          </>
        )}

        <Menu.Item
          icon="delete"
          onPress={() => setShowRemove(true)}
          title="Delete"
        />

        <ConfirmDialog
          title="Delete all data"
          show={showRemove}
          setShow={setShowRemove}
          onOk={remove}
          onCancel={() => setShowMenu(false)}>
          {ids.length === 0 ? (
            <>This irreversibly deletes all data from the app. Are you sure?</>
          ) : (
            <>This will delete {ids.length} records. Are you sure?</>
          )}
        </ConfirmDialog>
      </Menu>
    )

  return null
}
