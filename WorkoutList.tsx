import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native'
import {useCallback, useState} from 'react'
import {FlatList} from 'react-native'
import {List} from 'react-native-paper'
import DrawerHeader from './DrawerHeader'
import Page from './Page'
import GymSet from './gym-set'
import SetList from './SetList'
import WorkoutItem from './WorkoutItem'
import {WorkoutsPageParams} from './WorkoutsPage'
import {setRepo, settingsRepo} from './db'
import Settings from './settings'

const limit = 15

export default function WorkoutList() {
  const [workouts, setWorkouts] = useState<GymSet[]>()
  const [offset, setOffset] = useState(0)
  const [term, setTerm] = useState('')
  const [end, setEnd] = useState(false)
  const [settings, setSettings] = useState<Settings>()
  const navigation = useNavigation<NavigationProp<WorkoutsPageParams>>()

  const refresh = useCallback(async (value: string) => {
    const newWorkouts = await setRepo
      .createQueryBuilder()
      .select()
      .where('name LIKE :name', {name: `%${value}%`})
      .groupBy('name')
      .orderBy('name')
      .limit(limit)
      .getMany()
    console.log(`${WorkoutList.name}`, {newWorkout: newWorkouts[0]})
    setWorkouts(newWorkouts)
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
      <WorkoutItem
        images={settings?.images}
        item={item}
        key={item.name}
        onRemove={() => refresh(term)}
      />
    ),
    [refresh, term, settings?.images],
  )

  const next = useCallback(async () => {
    if (end) return
    const newOffset = offset + limit
    console.log(`${SetList.name}.next:`, {
      offset,
      limit,
      newOffset,
      term,
    })
    const newWorkouts = await setRepo
      .createQueryBuilder()
      .select()
      .where('name LIKE :name', {name: `%${term}%`})
      .groupBy('name')
      .orderBy('name')
      .limit(limit)
      .offset(newOffset)
      .getMany()
    if (newWorkouts.length === 0) return setEnd(true)
    if (!workouts) return
    setWorkouts([...workouts, ...newWorkouts])
    if (newWorkouts.length < limit) return setEnd(true)
    setOffset(newOffset)
  }, [term, end, offset, workouts])

  const onAdd = useCallback(async () => {
    navigation.navigate('EditWorkout', {
      value: new GymSet(),
    })
  }, [navigation])

  const search = useCallback(
    (value: string) => {
      setTerm(value)
      refresh(value)
    },
    [refresh],
  )

  return (
    <>
      <DrawerHeader name="Workouts" />
      <Page onAdd={onAdd} term={term} search={search}>
        {workouts?.length === 0 ? (
          <List.Item
            title="No workouts yet."
            description="A workout is something you do at the gym. For example Deadlifts are a workout."
          />
        ) : (
          <FlatList
            data={workouts}
            style={{flex: 1}}
            renderItem={renderItem}
            keyExtractor={w => w.name}
            onEndReached={next}
          />
        )}
      </Page>
    </>
  )
}
