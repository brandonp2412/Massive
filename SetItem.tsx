import React, {useContext, useState} from 'react';
import {GestureResponderEvent} from 'react-native';
import {List, Menu} from 'react-native-paper';
import {DatabaseContext} from './App';
import Set from './set';

export default function SetItem({
  item,
  setSet,
  onRemove,
}: {
  item: Set;
  setSet: (set: Set) => void;
  onRemove: () => void;
}) {
  const [show, setShow] = useState(false);
  const [anchor, setAnchor] = useState({x: 0, y: 0});
  const db = useContext(DatabaseContext);

  const remove = async () => {
    await db.executeSql(`DELETE FROM sets WHERE id = ?`, [item.id]);
    setShow(false);
    onRemove();
  };

  const copy = () => {
    const set = {...item};
    delete set.id;
    setSet(set);
    setShow(false);
  };

  const longPress = (e: GestureResponderEvent) => {
    setAnchor({x: e.nativeEvent.pageX, y: e.nativeEvent.pageY});
    setShow(true);
  };

  return (
    <>
      <List.Item
        onPress={() => {
          setSet(item);
        }}
        title={item.name}
        description={`${item.reps} x ${item.weight}${item.unit}`}
        onLongPress={longPress}
        right={() => (
          <Menu anchor={anchor} visible={show} onDismiss={() => setShow(false)}>
            <Menu.Item icon="trash" onPress={remove} title="Delete" />
            <Menu.Item icon="copy" onPress={copy} title="Copy" />
          </Menu>
        )}
      />
    </>
  );
}
