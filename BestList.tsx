import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native'
import { useCallback, useState } from 'react'
import { FlatList, Image } from 'react-native'
import { List } from 'react-native-paper'
import { BestPageParams } from './BestPage'
import { setRepo, settingsRepo } from './db'
import DrawerHeader from './DrawerHeader'
import GymSet from './gym-set'
import Page from './Page'
import Settings from './settings'

export default function BestList() {
  const [bests, setBests] = useState<GymSet[]>()
  const [term, setTerm] = useState('')
  const navigation = useNavigation<NavigationProp<BestPageParams>>()
  const [settings, setSettings] = useState<Settings>()

  useFocusEffect(
    useCallback(() => {
      settingsRepo.findOne({ where: {} }).then(setSettings)
    }, []),
  )

  const refresh = useCallback(async (value: string) => {
    const weights = await setRepo
      .createQueryBuilder()
      .select()
      .addSelect('MAX(weight)', 'weight')
      .where('name LIKE :name', { name: `%${value.trim()}%` })
      .andWhere('NOT hidden')
      .groupBy('name')
      .getMany()
    console.log(`${BestList.name}.refresh:`, { length: weights.length })
    let newBest: GymSet[] = []
    for (const set of weights) {
      const reps = await setRepo
        .createQueryBuilder()
        .select()
        .addSelect('MAX(reps)', 'reps')
        .where('name = :name', { name: set.name })
        .andWhere('weight = :weight', { weight: set.weight })
        .andWhere('NOT hidden')
        .groupBy('name')
        .getMany()
      newBest.push(...reps)
    }
    setBests(newBest)
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

  const renderItem = ({ item }: { item: GymSet }) => (
    <List.Item
      key={item.name}
      title={item.name}
      description={`${item.reps} x ${item.weight}${item.unit || 'kg'}`}
      onPress={() => navigation.navigate('ViewBest', { best: item })}
      left={() =>
        (settings.images && item.image && (
          <Image
            source={{ uri: item.image }}
            style={{ height: 75, width: 75 }}
          />
        )) ||
        null}
    />
  )

  return (
    <>
      <DrawerHeader name='Best' />
      <Page term={term} search={search}>
        {bests?.length === 0
          ? (
            <List.Item
              title='No exercises yet'
              description='Once sets have been added, this will highlight your personal bests.'
            />
          )
          : (
            <FlatList
              style={{ flex: 1 }}
              renderItem={renderItem}
              data={bests}
            />
          )}
      </Page>
    </>
  )
}
