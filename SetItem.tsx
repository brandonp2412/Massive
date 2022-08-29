import {NavigationProp, useNavigation} from '@react-navigation/native';
import React, {useCallback, useContext, useState} from 'react';
import {GestureResponderEvent, Image, Text} from 'react-native';
import {Divider, List, Menu} from 'react-native-paper';
import {DatabaseContext} from './App';
import {HomePageParams} from './HomePage';
import Set from './set';

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
  const db = useContext(DatabaseContext);
  const navigation = useNavigation<NavigationProp<HomePageParams>>();

  const remove = useCallback(async () => {
    await db.executeSql(`DELETE FROM sets WHERE id = ?`, [item.id]);
    setShowMenu(false);
    onRemove();
  }, [setShowMenu, db, onRemove, item.id]);

  const copy = useCallback(() => {
    const set: Set = {...item};
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
        onPress={() => navigation.navigate('EditSet', {set: item})}
        title={item.name}
        description={`${item.reps} x ${item.weight}${item.unit || 'kg'}`}
        onLongPress={longPress}
        left={() =>
          images && (
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
              <Menu.Item icon="copy" onPress={copy} title="Copy" />
              <Menu.Item
                icon="image-outline"
                onPress={toggleImages}
                title="Images"
              />
              <Menu.Item
                icon="calendar-outline"
                onPress={toggleDates}
                title="Dates"
              />
              <Divider />
              <Menu.Item icon="trash" onPress={remove} title="Delete" />
            </Menu>
          </>
        )}
      />
    </>
  );
}
