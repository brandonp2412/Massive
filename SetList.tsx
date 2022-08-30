import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {List, Searchbar} from 'react-native-paper';
import {DatabaseContext} from './Routes';
import DrawerMenu from './DrawerMenu';
import {HomePageParams} from './HomePage';
import MassiveFab from './MassiveFab';
import {Plan} from './plan';
import Set from './set';
import SetItem from './SetItem';
import Settings from './settings';
import {DAYS} from './time';

const limit = 15;
const defaultSet = {
  name: '',
  id: 0,
  reps: 10,
  weight: 20,
  unit: 'kg',
};

export default function SetList() {
  const [sets, setSets] = useState<Set[]>();
  const [set, setSet] = useState<Set>();
  const [workouts, setWorkouts] = useState<string[]>([]);
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [end, setEnd] = useState(false);
  const [dates, setDates] = useState(false);
  const [images, setImages] = useState(false);
  const db = useContext(DatabaseContext);
  const navigation = useNavigation<NavigationProp<HomePageParams>>();

  const selectSets = `
    SELECT * from sets 
    WHERE name LIKE ? AND NOT hidden
    ORDER BY created DESC 
    LIMIT ? OFFSET ?
  `;

  const refresh = useCallback(async () => {
    const [result] = await db.executeSql(selectSets, [`%${search}%`, limit, 0]);
    if (!result) return setSets([]);
    console.log(`${SetList.name}.refresh:`, {search, limit});
    setSets(result.rows.raw());
    setOffset(0);
    setEnd(false);
  }, [search, db, selectSets]);

  const refreshLoader = useCallback(async () => {
    setRefreshing(true);
    refresh().finally(() => setRefreshing(false));
  }, [setRefreshing, refresh]);

  useEffect(() => {
    refresh();
  }, [search, refresh]);

  const getTodaysPlan = useCallback(async (): Promise<Plan[]> => {
    const today = DAYS[new Date().getDay()];
    const [result] = await db.executeSql(
      `SELECT * FROM plans WHERE days LIKE ? LIMIT 1`,
      [`%${today}%`],
    );
    return result.rows.raw();
  }, [db]);

  const getTodaysSets = useCallback(async (): Promise<Set[]> => {
    const today = new Date().toISOString().split('T')[0];
    const [result] = await db.executeSql(
      `SELECT * FROM sets WHERE created LIKE ? ORDER BY created DESC`,
      [`${today}%`],
    );
    return result.rows.raw();
  }, [db]);

  const getBest = useCallback(
    async (query: string): Promise<Set> => {
      const bestWeight = `
      SELECT name, reps, unit, MAX(weight) AS weight 
      FROM sets
      WHERE name = ? AND NOT hidden
      GROUP BY name;
    `;
      const bestReps = `
      SELECT name, MAX(reps) as reps, unit, weight 
      FROM sets
      WHERE name = ? AND weight = ? AND NOT hidden
      GROUP BY name;
    `;
      const [weightResult] = await db.executeSql(bestWeight, [query]);
      if (!weightResult.rows.length) return {...defaultSet};
      const [repsResult] = await db.executeSql(bestReps, [
        query,
        weightResult.rows.item(0).weight,
      ]);
      return repsResult.rows.item(0);
    },
    [db],
  );

  const predict = useCallback(async () => {
    const [result] = await db.executeSql(`SELECT * FROM settings LIMIT 1`);
    const settings: Settings = result.rows.item(0);
    if (!settings.predict) return;
    const todaysPlan = await getTodaysPlan();
    if (todaysPlan.length === 0) return;
    const todaysSets = await getTodaysSets();
    const todaysWorkouts = todaysPlan[0].workouts.split(',');
    let workout = todaysWorkouts[0];
    if (todaysSets.length > 0) {
      const count = todaysSets.filter(
        s => s.name === todaysSets[0].name,
      ).length;
      workout = todaysSets[0].name;
      if (count >= Number(settings.sets))
        workout =
          todaysWorkouts[todaysWorkouts.indexOf(todaysSets[0].name!) + 1];
    }
    const best = await getBest(workout);
    setSet({...best});
    setWorkouts(todaysWorkouts);
  }, [getTodaysSets, getTodaysPlan, getBest, db]);

  useFocusEffect(
    useCallback(() => {
      refresh();
      predict();
      navigation.getParent()?.setOptions({
        headerRight: () => <DrawerMenu name="Home" />,
      });
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
    setRefreshing(true);
    const newOffset = offset + limit;
    console.log(`${SetList.name}.next:`, {
      offset,
      limit,
      newOffset,
      search,
    });
    const [result] = await db
      .executeSql(selectSets, [`%${search}%`, limit, newOffset])
      .finally(() => setRefreshing(false));
    if (result.rows.length === 0) return setEnd(true);
    if (!sets) return;
    setSets([...sets, ...result.rows.raw()]);
    if (result.rows.length < limit) return setEnd(true);
    setOffset(newOffset);
  }, [search, end, offset, sets, db, selectSets]);

  const onAdd = useCallback(async () => {
    navigation.navigate('EditSet', {
      set: set || {...defaultSet},
      workouts,
    });
  }, [navigation, set, workouts]);

  return (
    <View style={styles.container}>
      <Searchbar placeholder="Search" value={search} onChangeText={setSearch} />
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
        refreshing={refreshing}
        onRefresh={refreshLoader}
      />
      <MassiveFab onPress={onAdd} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 10,
    paddingBottom: '10%',
  },
});
