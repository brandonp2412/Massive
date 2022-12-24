import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native'
import {useCallback, useState} from 'react'
import {FlatList} from 'react-native'
import {List} from 'react-native-paper'
import {Like} from 'typeorm'
import {getNow, setRepo, settingsRepo} from './db'
import DrawerHeader from './DrawerHeader'
import GymSet, {defaultSet} from './gym-set'
import {HomePageParams} from './home-page-params'
import ListMenu from './ListMenu'
import Page from './Page'
import SetItem from './SetItem'
import Settings from './settings'

const limit = 15

export default function SetList() {
  const [sets, setSets] = useState<GymSet[]>([])
  const [offset, setOffset] = useState(0)
  const [term, setTerm] = useState('')
  const [end, setEnd] = useState(false)
  const [settings, setSettings] = useState<Settings>()
  const [ids, setIds] = useState<number[]>([])
  const navigation = useNavigation<NavigationProp<HomePageParams>>()

  const refresh = useCallback(async (value: string) => {
    const newSets = await setRepo.find({
      where: {name: Like(`%${value}%`), hidden: 0 as any},
      take: limit,
      skip: 0,
      order: {created: 'DESC'},
    })
    console.log(`${SetList.name}.refresh:`, {
      value,
      limit,
      length: newSets.length,
    })
    setSets(newSets)
    setOffset(0)
    setEnd(false)
  }, [])

  useFocusEffect(
    useCallback(() => {
      refresh(term)
      settingsRepo.findOne({where: {}}).then(setSettings)
    }, [refresh, term]),
  )

  const renderItem = useCallback(
    ({item}: {item: GymSet}) => (
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
    console.log(`${SetList.name}.next:`, {offset, newOffset, term})
    const newSets = await setRepo.find({
      where: {name: Like(`%${term}%`), hidden: 0 as any},
      take: limit,
      skip: newOffset,
      order: {created: 'DESC'},
    })
    if (newSets.length === 0) return setEnd(true)
    if (!sets) return
    setSets([...sets, ...newSets])
    if (newSets.length < limit) return setEnd(true)
    setOffset(newOffset)
  }, [term, end, offset, sets])

  const onAdd = useCallback(async () => {
    const [{now}] = await getNow()
    let set = sets[0]
    if (!set) set = {...defaultSet}
    set.created = now
    delete set.id
    navigation.navigate('EditSet', {set})
  }, [navigation, sets])

  const search = useCallback(
    (value: string) => {
      setTerm(value)
      refresh(value)
    },
    [refresh],
  )

  const edit = useCallback(() => {
    navigation.navigate('EditSets', {ids})
    setIds([])
  }, [ids, navigation])

  const copy = useCallback(async () => {
    const set = await setRepo.findOne({
      where: {id: ids.pop()},
    })
    delete set.id
    delete set.created
    navigation.navigate('EditSet', {set})
    setIds([])
  }, [ids, navigation])

  const clear = useCallback(() => {
    setIds([])
  }, [])

  const remove = useCallback(async () => {
    setIds([])
    await setRepo.delete(ids.length > 0 ? ids : {})
    await refresh(term)
  }, [ids, refresh, term])

  const select = useCallback(() => {
    setIds(sets.map(set => set.id))
  }, [sets])

  return (
    <>
      <DrawerHeader name="Home">
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
        {sets?.length === 0 ? (
          <List.Item
            title="No sets yet"
            description="A set is a group of repetitions. E.g. 8 reps of Squats."
          />
        ) : (
          settings && (
            <FlatList
              data={sets}
              style={{flex: 1}}
              renderItem={renderItem}
              onEndReached={next}
            />
          )
        )}
      </Page>
    </>
  )
}
