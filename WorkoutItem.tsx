import {NavigationProp, useNavigation} from '@react-navigation/native';
import React, {useCallback, useContext, useState} from 'react';
import {GestureResponderEvent, Text} from 'react-native';
import {List, Menu} from 'react-native-paper';
import {DatabaseContext} from './App';
import ConfirmDialog from './ConfirmDialog';
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
  const db = useContext(DatabaseContext);
  const navigation = useNavigation<NavigationProp<WorkoutsPageParams>>();

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
