import {
    NavigationProp,
    useFocusEffect,
    useNavigation,
} from '@react-navigation/native'
import { useCallback, useState } from 'react'
import { FlatList } from 'react-native'
import { List } from 'react-native-paper'
import { Like } from 'typeorm'
import DrawerHeader from './DrawerHeader'
import { FoodPageParams } from './FoodPage'
import ListMenu from './ListMenu'
import Page from './Page'
import SetItem from './SetItem'
import { foodRepo, getNow, settingsRepo } from './db'
import Food, { defaultFood } from './food'
import GymSet from './gym-set'
import Settings from './settings'

const limit = 15

export default function FoodList() {
  const [foods, setFoods] = useState<Food[]>([])
  const [offset, setOffset] = useState(0)
  const [term, setTerm] = useState('')
  const [end, setEnd] = useState(false)
  const [settings, setSettings] = useState<Settings>()
  const [ids, setIds] = useState<number[]>([])
  const navigation = useNavigation<NavigationProp<FoodPageParams>>()

  const refresh = useCallback(async (value: string) => {
    const newSets = await foodRepo.find({
      where: { name: Like(`%${value.trim()}%`) },
      take: limit,
      skip: 0,
      order: { created: 'DESC' },
    })
    console.log(`${FoodList.name}.refresh:`, { value, limit })
    setFoods(newSets)
    setOffset(0)
    setEnd(false)
  }, [])

  useFocusEffect(
    useCallback(() => {
      refresh(term)
      settingsRepo.findOne({ where: {} }).then(setSettings)
    }, [refresh, term]),
  )

  const renderItem = useCallback(
    ({ item }: { item: GymSet }) => (
      <SetItem
        settings={settings}
        item={item}
        key={item.id}
        onRemove={() => refresh(term)}
        ids={ids}
        setIds={setIds}
      />
    ),
    [refresh, term, settings, ids],
  )

  const next = useCallback(async () => {
    if (end) return
    const newOffset = offset + limit
    console.log(`${FoodList.name}.next:`, { offset, newOffset, term })
    const newSets = await foodRepo.find({
      where: { name: Like(`%${term}%`) },
      take: limit,
      skip: newOffset,
      order: { created: 'DESC' },
    })
    if (newSets.length === 0) return setEnd(true)
    if (!foods) return
    setFoods([...foods, ...newSets])
    if (newSets.length < limit) return setEnd(true)
    setOffset(newOffset)
  }, [term, end, offset, foods])

  const onAdd = useCallback(async () => {
    const now = await getNow()
    let food = foods[0]
    if (!food) food = { ...defaultFood }
    food.created = now
    delete food.id
    navigation.navigate('EditFood', { food })
  }, [navigation, foods])

  const search = useCallback(
    (value: string) => {
      setTerm(value)
      refresh(value)
    },
    [refresh],
  )

  const edit = useCallback(() => {
    navigation.navigate('EditFood', { ids })
    setIds([])
  }, [ids, navigation])

  const copy = useCallback(async () => {
    const food = await foodRepo.findOne({
      where: { id: ids.pop() },
    })
    delete food.id
    delete food.created
    navigation.navigate('EditFood', { food })
    setIds([])
  }, [ids, navigation])

  const clear = useCallback(() => {
    setIds([])
  }, [])

  const remove = useCallback(async () => {
    setIds([])
    await foodRepo.delete(ids.length > 0 ? ids : {})
    await refresh(term)
  }, [ids, refresh, term])

  const select = useCallback(() => {
    setIds(foods.map((set) => set.id))
  }, [foods])

  return (
    <>
      <DrawerHeader name={ids.length > 0 ? `${ids.length} selected` : 'Home'}>
        <ListMenu
          onClear={clear}
          onCopy={copy}
          onDelete={remove}
          onEdit={edit}
          ids={ids}
          onSelect={select}
        />
      </DrawerHeader>

      <Page onAdd={onAdd} term={term} search={search}>
        {foods?.length === 0
          ? (
            <List.Item
              title='No sets yet'
              description='A set is a group of repetitions. E.g. 8 reps of Squats.'
            />
          )
          : (
            settings && (
              <FlatList
                data={foods}
                style={{ flex: 1 }}
                renderItem={renderItem}
                onEndReached={next}
              />
            )
          )}
      </Page>
    </>
  )
}
