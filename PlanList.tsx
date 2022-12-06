import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native'
import {useCallback, useState} from 'react'
import {FlatList} from 'react-native'
import {List} from 'react-native-paper'
import {Like} from 'typeorm'
import {planRepo} from './db'
import DrawerHeader from './DrawerHeader'
import Page from './Page'
import {Plan} from './plan'
import {PlanPageParams} from './plan-page-params'
import PlanItem from './PlanItem'

export default function PlanList() {
  const [term, setTerm] = useState('')
  const [plans, setPlans] = useState<Plan[]>()
  const navigation = useNavigation<NavigationProp<PlanPageParams>>()

  const refresh = useCallback(async (value: string) => {
    planRepo.find({}).then(setPlans)
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
      <PlanItem item={item} key={item.id} onRemove={() => refresh(term)} />
    ),
    [refresh, term],
  )

  const onAdd = () =>
    navigation.navigate('EditPlan', {plan: {days: '', workouts: ''}})

  return (
    <>
      <DrawerHeader name="Plans" />
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
