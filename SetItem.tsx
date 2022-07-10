import React, {useCallback, useContext, useState} from 'react';
import {GestureResponderEvent} from 'react-native';
import {List, Menu} from 'react-native-paper';
import {DatabaseContext} from './App';
import Set from './set';

export default function SetItem({
  item,
  setEdit,
  setShowEdit,
  onRemove,
  setNewSet,
  setShowNew,
}: {
  item: Set;
  setEdit: (set: Set) => void;
  setNewSet: (set: Set) => void;
  setShowEdit: (show: boolean) => void;
  setShowNew: (show: boolean) => void;
  onRemove: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [anchor, setAnchor] = useState({x: 0, y: 0});
  const db = useContext(DatabaseContext);

  const remove = useCallback(async () => {
    await db.executeSql(`DELETE FROM sets WHERE id = ?`, [item.id]);
    setShowMenu(false);
    onRemove();
  }, [setShowMenu, db, onRemove, item.id]);

  const copy = useCallback(() => {
    const set = {...item};
    delete set.id;
    setNewSet(set);
    setShowMenu(false);
    setShowNew(true);
  }, [setNewSet, setShowMenu, item, setShowNew]);

  const longPress = useCallback(
    (e: GestureResponderEvent) => {
      setAnchor({x: e.nativeEvent.pageX, y: e.nativeEvent.pageY});
      setShowMenu(true);
    },
    [setShowMenu, setAnchor],
  );

  return (
    <>
      <List.Item
        onPress={() => {
          setEdit(item);
          setShowEdit(true);
        }}
        title={item.name}
        description={`${item.reps} x ${item.weight}${item.unit}`}
        onLongPress={longPress}
        right={() => (
          <Menu
            anchor={anchor}
            visible={showMenu}
            onDismiss={() => setShowMenu(false)}>
            <Menu.Item icon="trash" onPress={remove} title="Delete" />
            <Menu.Item icon="copy" onPress={copy} title="Copy" />
          </Menu>
        )}
      />
    </>
  );
}
