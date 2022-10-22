import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import React, {useCallback, useEffect, useState} from 'react';
import {FlatList} from 'react-native';
import {List} from 'react-native-paper';
import DrawerMenu from './DrawerMenu';
import {HomePageParams} from './home-page-params';
import Page from './Page';
import Set from './set';
import {defaultSet, getSets, getToday} from './set.service';
import SetItem from './SetItem';
import {useSettings} from './use-settings';

const limit = 15;

export default function SetList() {
  const [sets, setSets] = useState<Set[]>();
  const [set, setSet] = useState<Set>();
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState('');
  const [end, setEnd] = useState(false);
  const {settings} = useSettings();
  const navigation = useNavigation<NavigationProp<HomePageParams>>();

  const refresh = useCallback(async () => {
    const todaysSet = await getToday();
    if (todaysSet) setSet({...todaysSet});
    const newSets = await getSets({
      search: `%${search}%`,
      limit,
      offset: 0,
      format: settings.date || '%Y-%m-%d %H:%M',
    });
    console.log(`${SetList.name}.refresh:`, {first: newSets[0]});
    if (newSets.length === 0) return setSets([]);
    setSets(newSets);
    setOffset(0);
    setEnd(false);
  }, [search, settings.date]);

  useFocusEffect(
    useCallback(() => {
      refresh();
      navigation.getParent()?.setOptions({
        headerRight: () => <DrawerMenu name="Home" />,
      });
    }, [refresh, navigation]),
  );

  useEffect(() => {
    refresh();
  }, [search, refresh]);

  const renderItem = useCallback(
    ({item}: {item: Set}) => (
      <SetItem item={item} key={item.id} onRemove={refresh} />
    ),
    [refresh],
  );

  const next = useCallback(async () => {
    if (end) return;
    const newOffset = offset + limit;
    console.log(`${SetList.name}.next:`, {offset, newOffset, search});
    const newSets = await getSets({
      search: `%${search}%`,
      limit,
      offset: newOffset,
      format: settings.date || '%Y-%m-%d %H:%M',
    });
    if (newSets.length === 0) return setEnd(true);
    if (!sets) return;
    setSets([...sets, ...newSets]);
    if (newSets.length < limit) return setEnd(true);
    setOffset(newOffset);
  }, [search, end, offset, sets, settings.date]);

  const onAdd = useCallback(async () => {
    console.log(`${SetList.name}.onAdd`, {set});
    navigation.navigate('EditSet', {
      set: set || {...defaultSet},
    });
  }, [navigation, set]);

  return (
    <Page onAdd={onAdd} search={search} setSearch={setSearch}>
      {sets?.length === 0 ? (
        <List.Item
          title="No sets yet"
          description="A set is a group of repetitions. E.g. 8 reps of Squats."
        />
      ) : (
        <FlatList
          data={sets}
          style={{flex: 1}}
          renderItem={renderItem}
          keyExtractor={s => s.id!.toString()}
          onEndReached={next}
        />
      )}
    </Page>
  );
}
