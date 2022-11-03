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
import GymSet from './gym-set'
import {HomePageParams} from './home-page-params'
import Page from './Page'
import SetItem from './SetItem'
import Settings from './settings'

const limit = 15

export default function SetList() {
  const [sets, setSets] = useState<GymSet[]>([])
  const [set, setSet] = useState<GymSet>()
  const [offset, setOffset] = useState(0)
  const [term, setTerm] = useState('')
  const [end, setEnd] = useState(false)
  const [settings, setSettings] = useState<Settings>()
  const navigation = useNavigation<NavigationProp<HomePageParams>>()

  const refresh = useCallback(async (value: string) => {
    const newSets = await setRepo.find({
      where: {name: Like(`%${value}%`), hidden: 0 as any},
      take: limit,
      skip: 0,
      order: {created: 'DESC'},
    })
    console.log(`${SetList.name}.refresh:`, {newSets})
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {id, ...newSet} = newSets[0]
    setSet(newSet)
    if (newSets.length === 0) return setSets([])
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
      />
    ),
    [refresh, term, settings],
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
    console.log(`${SetList.name}.onAdd`, {set})
    const [{now}] = await getNow()
    const newSet: GymSet = set || {
      created: now,
      hidden: false,
      image: '',
      minutes: 3,
      seconds: 30,
      name: '',
      reps: 0,
      sets: 0,
      unit: 'kg',
      weight: 0,
    }
    newSet.created = now
    navigation.navigate('EditSet', {set: newSet})
  }, [navigation, set])

  const search = useCallback(
    (value: string) => {
      setTerm(value)
      refresh(value)
    },
    [refresh],
  )

  return (
    <>
      <DrawerHeader name="Home" />
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
