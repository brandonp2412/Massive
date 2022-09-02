import {NavigationProp, useNavigation} from '@react-navigation/native';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {GestureResponderEvent, Image} from 'react-native';
import {List, Menu, Text} from 'react-native-paper';
import ConfirmDialog from './ConfirmDialog';
import {DatabaseContext} from './Routes';
import Workout from './workout';
import {WorkoutsPageParams} from './WorkoutsPage';

export default function WorkoutItem({
  item,
  onRemoved,
}: {
  item: Workout;
  onRemoved: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [anchor, setAnchor] = useState({x: 0, y: 0});
  const [showRemove, setShowRemove] = useState('');
  const [uri, setUri] = useState('');
  const db = useContext(DatabaseContext);
  const navigation = useNavigation<NavigationProp<WorkoutsPageParams>>();

  useEffect(() => {
    db.executeSql(`SELECT image FROM sets WHERE name = ? LIMIT 1`, [
      item.name,
    ]).then(([result]) => {
      setUri(result.rows.item(0)?.image);
      console.log(WorkoutItem.name, item.name, result.rows.item(0)?.image);
    });
  }, [db, item.name]);

  const remove = useCallback(async () => {
    await db.executeSql(`DELETE FROM sets WHERE name = ?`, [item.name]);
    setShowMenu(false);
    onRemoved();
  }, [setShowMenu, db, onRemoved, item.name]);

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
        onPress={() => navigation.navigate('EditWorkout', {value: item})}
        title={item.name}
        onLongPress={longPress}
        right={() => (
          <>
            {uri && <Image source={{uri}} style={{height: 75, width: 75}} />}
            <Text
              style={{
                alignSelf: 'center',
              }}>
              <Menu
                anchor={anchor}
                visible={showMenu}
                onDismiss={() => setShowMenu(false)}>
                <Menu.Item
                  icon="trash"
                  onPress={() => {
                    setShowRemove(item.name);
                    setShowMenu(false);
                  }}
                  title="Delete"
                />
              </Menu>
            </Text>
          </>
        )}
      />
      <ConfirmDialog
        title={`Delete ${showRemove}`}
        show={!!showRemove}
        setShow={show => (show ? null : setShowRemove(''))}
        onOk={remove}>
        This irreversibly deletes ALL sets related to this workout. Are you
        sure?
      </ConfirmDialog>
    </>
  );
}
