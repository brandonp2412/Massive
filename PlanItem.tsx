import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native'
import {useCallback, useMemo, useState} from 'react'
import {GestureResponderEvent, Text} from 'react-native'
import {Divider, List, Menu} from 'react-native-paper'
import {getBestSet} from './best.service'
import {planRepo} from './db'
import {Plan} from './plan'
import {PlanPageParams} from './plan-page-params'
import {DAYS} from './time'

export default function PlanItem({
  item,
  onRemove,
}: {
  item: Plan
  onRemove: () => void
}) {
  const [show, setShow] = useState(false)
  const [anchor, setAnchor] = useState({x: 0, y: 0})
  const [today, setToday] = useState<string>()
  const days = useMemo(() => item.days.split(','), [item.days])
  const navigation = useNavigation<NavigationProp<PlanPageParams>>()

  useFocusEffect(
    useCallback(() => {
      const newToday = DAYS[new Date().getDay()]
      setToday(newToday)
    }, []),
  )

  const remove = useCallback(async () => {
    if (typeof item.id === 'number') await planRepo.delete(item.id)
    setShow(false)
    onRemove()
  }, [setShow, item.id, onRemove])

  const start = useCallback(async () => {
    console.log(`${PlanItem.name}.start:`, {item})
    setShow(false)
    navigation.navigate('StartPlan', {plan: item})
  }, [item, navigation])

  const longPress = useCallback(
    (e: GestureResponderEvent) => {
      setAnchor({x: e.nativeEvent.pageX, y: e.nativeEvent.pageY})
      setShow(true)
    },
    [setAnchor, setShow],
  )

  const edit = useCallback(() => {
    setShow(false)
    navigation.navigate('EditPlan', {plan: item})
  }, [navigation, item])

  const title = useMemo(
    () =>
      days.map((day, index) => (
        <Text key={day}>
          {day === today ? (
            <Text style={{fontWeight: 'bold', textDecorationLine: 'underline'}}>
              {day}
            </Text>
          ) : (
            day
          )}
          {index === days.length - 1 ? '' : ', '}
        </Text>
      )),
    [days, today],
  )

  const description = useMemo(
    () => item.workouts.replace(/,/g, ', '),
    [item.workouts],
  )

  return (
    <>
      <List.Item
        onPress={start}
        title={title}
        description={description}
        onLongPress={longPress}
        right={() => (
          <Menu anchor={anchor} visible={show} onDismiss={() => setShow(false)}>
            <Menu.Item icon="edit" onPress={edit} title="Edit" />
            <Divider />
            <Menu.Item icon="delete" onPress={remove} title="Delete" />
          </Menu>
        )}
      />
    </>
  )
}
