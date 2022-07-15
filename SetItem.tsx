import {NavigationProp, useNavigation} from '@react-navigation/native';
import React, {useCallback, useContext, useState} from 'react';
import {GestureResponderEvent, Text} from 'react-native';
import {Divider, List, Menu} from 'react-native-paper';
import {DatabaseContext} from './App';
import {HomePageParams} from './HomePage';
import Set from './set';
import {format} from './time';

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
  const navigation = useNavigation<NavigationProp<HomePageParams>>();

  const remove = useCallback(async () => {
    await db.executeSql(`DELETE FROM sets WHERE id = ?`, [item.id]);
    setShowMenu(false);
    onRemove();
  }, [setShowMenu, db, onRemove, item.id]);

  const copy = useCallback(() => {
    const set: Set = {...item};
    set.created = new Date().toISOString();
    set.id = 0;
    setShowMenu(false);
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
          <>
            <Text
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                alignContent: 'center',
                alignSelf: 'center',
              }}>
              {format(new Date(item.created))}
            </Text>
            <Menu
              anchor={anchor}
              visible={showMenu}
              onDismiss={() => setShowMenu(false)}>
              <Menu.Item icon="copy" onPress={copy} title="Copy" />
              <Divider />
              <Menu.Item icon="trash" onPress={remove} title="Delete" />
            </Menu>
          </>
        )}
      />
    </>
  );
}
