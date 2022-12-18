import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native'
import {useCallback, useState} from 'react'
import {FlatList} from 'react-native'
import {Divider, IconButton, List, Menu} from 'react-native-paper'
import {Like} from 'typeorm'
import ConfirmDialog from './ConfirmDialog'
import {planRepo} from './db'
import DrawerHeader from './DrawerHeader'
import Page from './Page'
import {Plan} from './plan'
import {PlanPageParams} from './plan-page-params'
import PlanItem from './PlanItem'
import useDark from './use-dark'

export default function PlanList() {
  const [term, setTerm] = useState('')
  const [plans, setPlans] = useState<Plan[]>()
  const [ids, setIds] = useState<number[]>([])
  const [showMenu, setShowMenu] = useState(false)
  const [showRemove, setShowRemove] = useState(false)
  const dark = useDark()
  const navigation = useNavigation<NavigationProp<PlanPageParams>>()

  const refresh = useCallback(async (value: string) => {
    planRepo
      .find({
        where: [{days: Like(`%${value}%`)}, {workouts: Like(`%${value}%`)}],
      })
      .then(setPlans)
  }, [])

  useFocusEffect(
    useCallback(() => {
      refresh(term)
    }, [refresh, term]),
  )

  const search = useCallback(
    (value: string) => {
      setTerm(value)
      refresh(value)
    },
    [refresh],
  )

  const renderItem = useCallback(
    ({item}: {item: Plan}) => (
      <PlanItem ids={ids} setIds={setIds} item={item} key={item.id} />
    ),
    [ids],
  )

  const onAdd = () =>
    navigation.navigate('EditPlan', {plan: {days: '', workouts: ''}})

  const edit = useCallback(async () => {
    setShowMenu(false)
    const plan = await planRepo.findOne({where: {id: ids.pop()}})
    navigation.navigate('EditPlan', {plan})
    setIds([])
  }, [ids, navigation])

  const copy = useCallback(async () => {
    setShowMenu(false)
    const plan = await planRepo.findOne({
      where: {id: ids.pop()},
    })
    delete plan.id
    navigation.navigate('EditPlan', {plan})
    setIds([])
  }, [ids, navigation])

  const clear = useCallback(() => {
    setShowMenu(false)
    setIds([])
  }, [])

  const remove = useCallback(async () => {
    setShowMenu(false)
    setShowRemove(false)
    await planRepo.delete(ids.length > 0 ? ids : {})
    await refresh(term)
    setIds([])
  }, [ids, refresh, term])

  const menuItems = (
    <>
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
    </>
  )

  return (
    <>
      <DrawerHeader name="Plans">
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
          {menuItems}

          <ConfirmDialog
            title="Delete plans"
            show={showRemove}
            setShow={setShowRemove}
            onOk={remove}
            onCancel={() => setShowMenu(false)}>
            {ids?.length === 0 ? (
              <>
                This irreversibly deletes all plans from the app. Are you sure?
              </>
            ) : (
              <>This will delete {ids?.length} plan(s). Are you sure?</>
            )}
          </ConfirmDialog>
        </Menu>
      </DrawerHeader>
      <Page onAdd={onAdd} term={term} search={search}>
        {plans?.length === 0 ? (
          <List.Item
            title="No plans yet"
            description="A plan is a list of workouts for certain days."
          />
        ) : (
          <FlatList
            style={{flex: 1}}
            data={plans}
            renderItem={renderItem}
            keyExtractor={set => set.id?.toString() || ''}
          />
        )}
      </Page>
    </>
  )
}
