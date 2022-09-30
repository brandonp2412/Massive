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
import {HomePageParams} from './home-page-params';
import Page from './Page';
import {getTodaysPlan} from './plan.service';
import Set from './set';
import {countToday, defaultSet, getSets, getToday} from './set.service';
import SetItem from './SetItem';
import {settings} from './settings.service';

const limit = 15;

export default function SetList() {
  const [sets, setSets] = useState<Set[]>();
  const [set, setSet] = useState<Set>();
  const [count, setCount] = useState(0);
  const [workouts, setWorkouts] = useState<string[]>([]);
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState('');
  const [end, setEnd] = useState(false);
  const [dates, setDates] = useState(false);
  const [images, setImages] = useState(true);
  const navigation = useNavigation<NavigationProp<HomePageParams>>();

  const predict = useCallback(async () => {
    setCount(0);
    setSet({...defaultSet});
    if (settings.newSet === 'empty') return;
    const todaysSet = await getToday();
    console.log(`${SetList.name}.predict:`, {todaysSet});
    if (!settings.newSet && todaysSet) return setSet({...todaysSet});
    const todaysPlan = await getTodaysPlan();
    console.log(`${SetList.name}.predict:`, {todaysPlan});
    if (todaysPlan.length === 0) return;
    const todaysWorkouts = todaysPlan[0].workouts.split(',');
    setWorkouts(todaysWorkouts);
    let workout = todaysWorkouts[0];
    let best = await getBestSet(workout);
    console.log(`${SetList.name}.predict:`, {workout, best});
    if (!todaysSet || !todaysWorkouts.includes(todaysSet.name))
      return setSet(best);
    let _count = await countToday(todaysSet.name);
    console.log(`${SetList.name}.predict:`, {_count});
    workout = todaysSet.name;
    best = await getBestSet(workout);
    const index = todaysWorkouts.indexOf(todaysSet.name) + 1;
    if (_count >= Number(best.sets)) {
      best = await getBestSet(todaysWorkouts[index]);
      _count = 0;
    }
    if (best.name === '') setCount(0);
    else setCount(_count);
    setSet(best);
  }, []);

  const refresh = useCallback(async () => {
    predict();
    const newSets = await getSets({search: `%${search}%`, limit, offset: 0});
    console.log(`${SetList.name}.refresh:`, {first: newSets[0]});
    if (newSets.length === 0) return setSets([]);
    setSets(newSets);
    setOffset(0);
    setEnd(false);
  }, [search, predict]);

  useFocusEffect(
    useCallback(() => {
      refresh();
      navigation.getParent()?.setOptions({
        headerRight: () => <DrawerMenu name="Home" />,
      });
      setImages(!!settings.images);
    }, [refresh, navigation]),
  );

  useEffect(() => {
    refresh();
  }, [search, refresh]);

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
    console.log(`${SetList.name}.next:`, {offset, newOffset, search});
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
    console.log(`${SetList.name}.onAdd`, {set, workouts});
    navigation.navigate('EditSet', {
      set: set || {...defaultSet},
      workouts,
      count,
    });
  }, [navigation, set, workouts, count]);

  return (
    <Page onAdd={onAdd} search={search} setSearch={setSearch}>
      <FlatList
        data={sets}
        style={{height: '99%'}}
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
