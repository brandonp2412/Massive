import {NavigationProp, useNavigation} from '@react-navigation/native';
import React, {useCallback, useState} from 'react';
import {GestureResponderEvent} from 'react-native';
import {List, Menu} from 'react-native-paper';
import {DrawerParamList} from './drawer-param-list';
import {Plan} from './plan';
import {deletePlan} from './plan.service';

export default function PlanItem({
  item,
  onRemove,
}: {
  item: Plan;
  onRemove: () => void;
}) {
  const [show, setShow] = useState(false);
  const [anchor, setAnchor] = useState({x: 0, y: 0});
  const navigation = useNavigation<NavigationProp<DrawerParamList>>();

  const remove = useCallback(async () => {
    if (typeof item.id === 'number') await deletePlan(item.id);
    setShow(false);
    onRemove();
  }, [setShow, item.id, onRemove]);

  const longPress = useCallback(
    (e: GestureResponderEvent) => {
      setAnchor({x: e.nativeEvent.pageX, y: e.nativeEvent.pageY});
      setShow(true);
    },
    [setAnchor, setShow],
  );

  return (
    <>
      <List.Item
        onPress={() => navigation.navigate('Edit plan', {plan: item})}
        title={
          item.days
            ? item.days.replace(/,/g, ', ')
            : item.workouts.replace(/,/g, ', ')
        }
        description={item.days ? item.workouts.replace(/,/g, ', ') : null}
        onLongPress={longPress}
        right={() => (
          <Menu anchor={anchor} visible={show} onDismiss={() => setShow(false)}>
            <Menu.Item icon="delete" onPress={remove} title="Delete" />
          </Menu>
        )}
      />
    </>
  );
}
