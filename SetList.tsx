import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import React, {useCallback, useEffect, useState} from 'react';
import {FlatList} from 'react-native';
import {List} from 'react-native-paper';
import {getBestSet} from './best.service';
import DrawerMenu from './DrawerMenu';
import {HomePageParams} from './HomePage';
import Page from './Page';
import {getTodaysPlan} from './plan.service';
import Set from './set';
import {defaultSet, getSets, getTodaysSets} from './set.service';
import SetItem from './SetItem';
import {getSettings} from './settings.service';

const limit = 15;

export default function SetList() {
  const [sets, setSets] = useState<Set[]>();
  const [set, setSet] = useState<Set>();
  const [workouts, setWorkouts] = useState<string[]>([]);
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState('');
  const [end, setEnd] = useState(false);
  const [dates, setDates] = useState(false);
  const [images, setImages] = useState(true);
  const navigation = useNavigation<NavigationProp<HomePageParams>>();

  const refresh = useCallback(async () => {
    const newSets = await getSets({search: `%${search}%`, limit, offset: 0});
    if (newSets.length === 0) return setSets([]);
    setSets(newSets);
    setOffset(0);
    setEnd(false);
  }, [search]);

  useEffect(() => {
    refresh();
  }, [search, refresh]);

  const predict = useCallback(async () => {
    const settings = await getSettings();
    if (!settings.predict) return;
    const todaysPlan = await getTodaysPlan();
    console.log(`${SetList.name}.predict:`, {todaysPlan});
    if (todaysPlan.length === 0) return;
    const todaysSets = await getTodaysSets();
    const todaysWorkouts = todaysPlan[0].workouts.split(',');
    let workout = todaysWorkouts[0];
    console.log(`${SetList.name}.predict:`, {todaysSets, todaysWorkouts});
    if (todaysWorkouts.includes(todaysSets[0]?.name) && todaysSets.length > 0) {
      const count = todaysSets.filter(
        s => s.name === todaysSets[0].name,
      ).length;
      workout = todaysSets[0].name;
      if (count >= Number(settings.sets))
        workout =
          todaysWorkouts[todaysWorkouts.indexOf(todaysSets[0].name!) + 1];
    }
    console.log(`${SetList.name}.predict:`, {workout});
    const best = await getBestSet(workout);
    console.log(`${SetList.name}.predict:`, {best});
    setSet({...best});
    setWorkouts(todaysWorkouts);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
      predict();
      navigation.getParent()?.setOptions({
        headerRight: () => <DrawerMenu name="Home" />,
      });
      getSettings().then(settings => setImages(!!settings.images));
    }, [refresh, predict, navigation]),
  );

  const renderItem = useCallback(
    ({item}: {item: Set}) => (
      <SetItem
        dates={dates}
        setDates={setDates}
        images={images}
        setImages={setImages}
        item={item}
        key={item.id}
        onRemove={refresh}
      />
    ),
    [refresh, dates, setDates, images, setImages],
  );

  const next = useCallback(async () => {
    if (end) return;
    const newOffset = offset + limit;
    console.log(`${SetList.name}.next:`, {
      offset,
      limit,
      newOffset,
      search,
    });
    const newSets = await getSets({
      search: `%${search}%`,
      limit,
      offset: newOffset,
    });
    if (newSets.length === 0) return setEnd(true);
    if (!sets) return;
    setSets([...sets, ...newSets]);
    if (newSets.length < limit) return setEnd(true);
    setOffset(newOffset);
  }, [search, end, offset, sets]);

  const onAdd = useCallback(async () => {
    navigation.navigate('EditSet', {
      set: set || {...defaultSet},
      workouts,
    });
  }, [navigation, set, workouts]);

  return (
    <Page onAdd={onAdd} search={search} setSearch={setSearch}>
      <FlatList
        data={sets}
        style={{height: '100%'}}
        ListEmptyComponent={
          <List.Item
            title="No sets yet"
            description="A set is a group of repetitions. E.g. 8 reps of Squats."
          />
        }
        renderItem={renderItem}
        keyExtractor={s => s.id!.toString()}
        onEndReached={next}
      />
    </Page>
  );
}
