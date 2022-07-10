import {NavigationProp, useNavigation} from '@react-navigation/native';
import React, {useCallback, useContext, useState} from 'react';
import {GestureResponderEvent} from 'react-native';
import {List, Menu} from 'react-native-paper';
import {DatabaseContext} from './App';
import {StackParams} from './HomePage';
import Set from './set';

export default function SetItem({
  item,
  onRemove,
}: {
  item: Set;
  onRemove: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [anchor, setAnchor] = useState({x: 0, y: 0});
  const db = useContext(DatabaseContext);
  const navigation = useNavigation<NavigationProp<StackParams>>();

  const remove = useCallback(async () => {
    await db.executeSql(`DELETE FROM sets WHERE id = ?`, [item.id]);
    setShowMenu(false);
    onRemove();
  }, [setShowMenu, db, onRemove, item.id]);

  const copy = useCallback(() => {
    const set: Set = {...item};
    set.created = new Date().toISOString();
    set.id = 0;
    navigation.navigate('EditSet', {set});
  }, [navigation, item]);

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
        onPress={() => navigation.navigate('EditSet', {set: item})}
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
