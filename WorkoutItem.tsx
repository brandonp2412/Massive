import {NavigationProp, useNavigation} from '@react-navigation/native';
import React, {useCallback, useMemo, useState} from 'react';
import {GestureResponderEvent, Image} from 'react-native';
import {List, Menu, Text} from 'react-native-paper';
import ConfirmDialog from './ConfirmDialog';
import Set from './set';
import {deleteSetsBy} from './set.service';
import {useSettings} from './use-settings';
import {WorkoutsPageParams} from './WorkoutsPage';

export default function WorkoutItem({
  item,
  onRemoved,
}: {
  item: Set;
  onRemoved: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [anchor, setAnchor] = useState({x: 0, y: 0});
  const [showRemove, setShowRemove] = useState('');
  const {settings} = useSettings();
  const navigation = useNavigation<NavigationProp<WorkoutsPageParams>>();

  const remove = useCallback(async () => {
    await deleteSetsBy(item.name);
    setShowMenu(false);
    onRemoved();
  }, [setShowMenu, onRemoved, item.name]);

  const longPress = useCallback(
    (e: GestureResponderEvent) => {
      setAnchor({x: e.nativeEvent.pageX, y: e.nativeEvent.pageY});
      setShowMenu(true);
    },
    [setShowMenu, setAnchor],
  );

  const description = useMemo(() => {
    const minutes = item.minutes?.toString().padStart(2, '0');
    const seconds = item.seconds?.toString().padStart(2, '0');
    if (settings.alarm) return `${item.sets} sets ${minutes}:${seconds} rest`;
    return `${item.sets} sets`;
  }, [item, settings.alarm]);

  return (
    <>
      <List.Item
        onPress={() => navigation.navigate('EditWorkout', {value: item})}
        title={item.name}
        description={description}
        onLongPress={longPress}
        left={() =>
          !!settings.images &&
          item.image && (
            <Image source={{uri: item.image}} style={{height: 75, width: 75}} />
          )
        }
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
                icon="delete"
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
