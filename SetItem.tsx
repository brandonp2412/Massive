import {NavigationProp, useNavigation} from '@react-navigation/native';
import React, {useCallback, useState} from 'react';
import {GestureResponderEvent, Image} from 'react-native';
import {Divider, List, Menu, Text} from 'react-native-paper';
import {DrawerParamList} from './drawer-param-list';
import Set from './set';
import {deleteSet} from './set.service';

export default function SetItem({
  item,
  onRemove,
  dates,
  setDates,
  images,
  setImages,
}: {
  item: Set;
  onRemove: () => void;
  dates: boolean;
  setDates: (value: boolean) => void;
  images: boolean;
  setImages: (value: boolean) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [anchor, setAnchor] = useState({x: 0, y: 0});
  const navigation = useNavigation<NavigationProp<DrawerParamList>>();

  const remove = useCallback(async () => {
    if (typeof item.id === 'number') await deleteSet(item.id);
    setShowMenu(false);
    onRemove();
  }, [setShowMenu, onRemove, item.id]);

  const copy = useCallback(() => {
    const set: Set = {...item};
    delete set.id;
    setShowMenu(false);
    navigation.navigate('Edit set', {set, workouts: [], count: 0});
  }, [navigation, item]);

  const longPress = useCallback(
    (e: GestureResponderEvent) => {
      setAnchor({x: e.nativeEvent.pageX, y: e.nativeEvent.pageY});
      setShowMenu(true);
    },
    [setShowMenu, setAnchor],
  );

  const toggleDates = useCallback(() => {
    setDates(!dates);
    setShowMenu(false);
  }, [dates, setDates]);

  const toggleImages = useCallback(() => {
    setImages(!images);
    setShowMenu(false);
  }, [images, setImages]);

  return (
    <>
      <List.Item
        onPress={() =>
          navigation.navigate('Edit set', {set: item, workouts: [], count: 0})
        }
        title={item.name}
        description={`${item.reps} x ${item.weight}${item.unit || 'kg'}`}
        onLongPress={longPress}
        left={() =>
          images &&
          item.image && (
            <Image source={{uri: item.image}} style={{height: 75, width: 75}} />
          )
        }
        right={() => (
          <>
            {dates && (
              <Text
                style={{
                  alignSelf: 'center',
                }}>
                {item.created?.replace('T', ' ')}
              </Text>
            )}
            <Menu
              anchor={anchor}
              visible={showMenu}
              onDismiss={() => setShowMenu(false)}>
              <Menu.Item icon="content-copy" onPress={copy} title="Copy" />
              <Menu.Item icon="image" onPress={toggleImages} title="Images" />
              <Menu.Item icon="event" onPress={toggleDates} title="Dates" />
              <Divider />
              <Menu.Item icon="delete" onPress={remove} title="Delete" />
            </Menu>
          </>
        )}
      />
    </>
  );
}
