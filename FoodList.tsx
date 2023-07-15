import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native'
import { useCallback, useState } from 'react'
import { FlatList } from 'react-native'
import { ActivityIndicator, List } from 'react-native-paper'
import { Like } from 'typeorm'
import DrawerHeader from './DrawerHeader'
import FoodItem from './FoodItem'
import { FoodPageParams } from './FoodPage'
import ListMenu from './ListMenu'
import Page from './Page'
import { foodRepo, getNow, settingsRepo } from './db'
import Food, { defaultFood } from './food'
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
    const newFoods = await foodRepo.find({
      where: { name: Like(`%${value.trim()}%`) },
      take: limit,
      skip: 0,
      order: { created: 'DESC' },
    })
    console.log(`${FoodList.name}.refresh:`, { value, limit })
    setFoods(newFoods)
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
    ({ item }: { item: Food }) => (
      <FoodItem
        settings={settings}
        food={item}
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
    const newFoods = await foodRepo.find({
      where: { name: Like(`%${term}%`) },
      take: limit,
      skip: newOffset,
      order: { created: 'DESC' },
    })
    if (newFoods.length === 0) return setEnd(true)
    if (!foods) return
    setFoods([...foods, ...newFoods])
    if (newFoods.length < limit) return setEnd(true)
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

  const editFoods = useCallback(() => {
    navigation.navigate('EditFoods', { ids })
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

  if (!settings) return <ActivityIndicator />

  return (
    <>
      <DrawerHeader name={ids.length > 0 ? `${ids.length} selected` : 'Food'}>
        <ListMenu
          onClear={clear}
          onCopy={copy}
          onDelete={remove}
          onEdit={editFoods}
          ids={ids}
          onSelect={select}
        />
      </DrawerHeader>

      <Page onAdd={onAdd} term={term} search={search}>
        {foods?.length === 0
          ? (
            <List.Item
              title='No food yet'
              description='Start by adding what you ate today.'
            />
          )
          : (
            <FlatList
              data={foods}
              style={{ flex: 1 }}
              renderItem={renderItem}
              onEndReached={next}
            />
          )}
      </Page>
    </>
  )
}
