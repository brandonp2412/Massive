import React, {useCallback, useContext, useState} from 'react';
import {GestureResponderEvent} from 'react-native';
import {List, Menu} from 'react-native-paper';
import {DatabaseContext} from './App';
import {Plan} from './plan';

export default function PlanItem({
  item,
  setPlan,
  onRemove,
}: {
  item: Plan;
  setPlan: (plan: Plan) => void;
  onRemove: () => void;
}) {
  const [show, setShow] = useState(false);
  const [anchor, setAnchor] = useState({x: 0, y: 0});
  const db = useContext(DatabaseContext);

  const remove = useCallback(async () => {
    await db.executeSql(`DELETE FROM plans WHERE id = ?`, [item.id]);
    setShow(false);
    onRemove();
  }, [db, setShow, item.id, onRemove]);

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
        onPress={() => setPlan(item)}
        title={item.days.replace(/,/g, ', ')}
        description={item.workouts.replace(/,/g, ', ')}
        onLongPress={longPress}
        right={() => (
          <Menu anchor={anchor} visible={show} onDismiss={() => setShow(false)}>
            <Menu.Item icon="trash" onPress={remove} title="Delete" />
          </Menu>
        )}
      />
    </>
  );
}
