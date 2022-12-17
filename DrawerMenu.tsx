import {NavigationProp, useNavigation} from '@react-navigation/native'
import {useCallback, useState} from 'react'
import {Divider, IconButton, Menu} from 'react-native-paper'
import ConfirmDialog from './ConfirmDialog'
import {planRepo, setRepo} from './db'
import {DrawerParamList} from './drawer-param-list'
import {HomePageParams} from './home-page-params'
import {PlanPageParams} from './plan-page-params'
import useDark from './use-dark'

export default function DrawerMenu({
  name,
  ids,
  setIds,
}: {
  name: keyof DrawerParamList
  ids?: number[]
  setIds?: (values: number[]) => void
}) {
  const [showMenu, setShowMenu] = useState(false)
  const [showRemove, setShowRemove] = useState(false)
  const {reset} = useNavigation<NavigationProp<DrawerParamList>>()
  const home = useNavigation<NavigationProp<HomePageParams>>()
  const plans = useNavigation<NavigationProp<PlanPageParams>>()
  const dark = useDark()

  const remove = useCallback(async () => {
    setShowMenu(false)
    setShowRemove(false)
    if (name === 'Home') await setRepo.delete(ids.length > 0 ? ids : {})
    else if (name === 'Plans') await planRepo.delete(ids.length > 0 ? ids : {})
    reset({index: 0, routes: [{name}]})
  }, [reset, name, ids])

  const edit = useCallback(async () => {
    setShowMenu(false)
    if (name === 'Home') home.navigate('EditSets', {ids})
    else if (name === 'Plans') {
      const plan = await planRepo.findOne({where: {id: ids[0]}})
      plans.navigate('EditPlan', {plan})
    }
    setIds([])
  }, [ids, home, name, plans, setIds])

  const copy = useCallback(async () => {
    if (name === 'Home') {
      const set = await setRepo.findOne({
        where: {id: ids.pop()},
      })
      delete set.id
      home.navigate('EditSet', {set})
    } else if (name === 'Plans') {
      const plan = await planRepo.findOne({
        where: {id: ids.pop()},
      })
      delete plan.id
      plans.navigate('EditPlan', {plan})
    }
    setShowMenu(false)
    setIds([])
  }, [name, home, plans, setIds, ids])

  const clear = useCallback(() => {
    setShowMenu(false)
    setIds([])
  }, [setIds])

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
          icon="edit"
          title="Edit"
          onPress={edit}
          disabled={ids?.length === 0}
        />
        <Menu.Item
          icon="content-copy"
          title="Copy"
          onPress={copy}
          disabled={ids?.length === 0}
        />
        <Menu.Item
          icon="clear"
          title="Clear"
          onPress={clear}
          disabled={ids?.length === 0}
        />
        <Divider />

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
          {ids?.length === 0 ? (
            <>This irreversibly deletes all data from the app. Are you sure?</>
          ) : (
            <>This will delete {ids?.length} records. Are you sure?</>
          )}
        </ConfirmDialog>
      </Menu>
    )

  return null
}
