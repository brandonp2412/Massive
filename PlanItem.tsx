import {NavigationProp, useNavigation} from '@react-navigation/native';
import React, {useCallback, useMemo, useState} from 'react';
import {GestureResponderEvent, Text} from 'react-native';
import {List, Menu} from 'react-native-paper';
import {getBestSet} from './best.service';
import {Plan} from './plan';
import {PlanPageParams} from './plan-page-params';
import {deletePlan} from './plan.service';
import {DAYS} from './time';

export default function PlanItem({
  item,
  onRemove,
}: {
  item: Plan;
  onRemove: () => void;
}) {
  const [show, setShow] = useState(false);
  const [anchor, setAnchor] = useState({x: 0, y: 0});
  const days = useMemo(() => item.days.split(','), [item.days]);
  const navigation = useNavigation<NavigationProp<PlanPageParams>>();
  const today = useMemo(() => DAYS[new Date().getDay()], []);

  const remove = useCallback(async () => {
    if (typeof item.id === 'number') await deletePlan(item.id);
    setShow(false);
    onRemove();
  }, [setShow, item.id, onRemove]);

  const start = useCallback(async () => {
    const workouts = item.workouts.split(',');
    const first = workouts[0];
    const set = await getBestSet(first);
    setShow(false);
    navigation.navigate('StartPlan', {plan: item, set});
  }, [item, navigation]);

  const longPress = useCallback(
    (e: GestureResponderEvent) => {
      setAnchor({x: e.nativeEvent.pageX, y: e.nativeEvent.pageY});
      setShow(true);
    },
    [setAnchor, setShow],
  );

  const edit = useCallback(() => {
    setShow(false);
    navigation.navigate('EditPlan', {plan: item});
  }, [navigation, item]);

  return (
    <>
      <List.Item
        onPress={start}
        title={days.map((day, index) => (
          <Text key={day}>
            {day === today ? (
              <Text
                style={{fontWeight: 'bold', textDecorationLine: 'underline'}}>
                {day}
              </Text>
            ) : (
              day
            )}
            {index === days.length - 1 ? '' : ', '}
          </Text>
        ))}
        description={item.days ? item.workouts.replace(/,/g, ', ') : null}
        onLongPress={longPress}
        right={() => (
          <Menu anchor={anchor} visible={show} onDismiss={() => setShow(false)}>
            <Menu.Item icon="edit" onPress={edit} title="Edit" />
            <Menu.Item icon="delete" onPress={remove} title="Delete" />
          </Menu>
        )}
      />
    </>
  );
}
