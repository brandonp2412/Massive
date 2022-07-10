import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {FlatList, NativeModules, StyleSheet, View} from 'react-native';
import {List, Searchbar} from 'react-native-paper';
import {DatabaseContext} from './App';
import EditSet from './EditSet';
import MassiveFab from './MassiveFab';
import {Plan} from './plan';
import Set from './set';
import SetItem from './SetItem';
import {DAYS} from './time';

const limit = 15;

export default function HomePage() {
  const [sets, setSets] = useState<Set[]>();
  const [offset, setOffset] = useState(0);
  const [edit, setEdit] = useState<Set>();
  const [showEdit, setShowEdit] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newSet, setNewSet] = useState<Set>();
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [end, setEnd] = useState(false);
  const db = useContext(DatabaseContext);

  const selectSets = `
    SELECT * from sets 
    WHERE name LIKE ? 
    ORDER BY created DESC 
    LIMIT ? OFFSET ?
  `;

  const refresh = useCallback(async () => {
    const [result] = await db.executeSql(selectSets, [`%${search}%`, limit, 0]);
    if (!result) return setSets([]);
    console.log(`${HomePage.name}.refresh:`, {search, limit});
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

  const renderItem = useCallback(
    ({item}: {item: Set}) => (
      <SetItem
        setNewSet={setNewSet}
        item={item}
        key={item.id}
        setEdit={setEdit}
        onRemove={refresh}
        setShowEdit={setShowEdit}
        setShowNew={setShowNew}
      />
    ),
    [setEdit, refresh, setNewSet],
  );

  const update = useCallback(async () => {
    console.log('HomePage.update', {edit});
    await db.executeSql(
      `UPDATE sets SET name = ?, reps = ?, weight = ?, created = ?, unit = ? WHERE id = ?`,
      [
        edit?.name,
        edit?.reps,
        edit?.weight,
        edit?.created,
        edit?.unit,
        edit?.id,
      ],
    );
    setShowEdit(false);
    await refresh();
  }, [edit, setShowEdit, refresh, db]);

  const add = useCallback(async () => {
    if (
      newSet?.name === undefined ||
      newSet?.reps === 0 ||
      newSet?.weight === 0
    )
      return;
    await db.executeSql(
      `INSERT INTO sets(name, reps, weight, created, unit) VALUES (?,?,?,?,?)`,
      [
        newSet?.name,
        newSet?.reps,
        newSet?.weight,
        new Date().toISOString(),
        newSet?.unit || 'kg',
      ],
    );
    setShowNew(false);
    await refresh();
    const enabled = await AsyncStorage.getItem('alarmEnabled');
    if (enabled !== 'true') return;
    const minutes = await AsyncStorage.getItem('minutes');
    const seconds = await AsyncStorage.getItem('seconds');
    const milliseconds = Number(minutes) * 60 * 1000 + Number(seconds) * 1000;
    NativeModules.AlarmModule.timer(milliseconds);
  }, [newSet, setShowNew, refresh, db]);

  const next = useCallback(async () => {
    if (end) return;
    setRefreshing(true);
    const newOffset = offset + limit;
    console.log(`${HomePage.name}.next:`, {
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

  const onAdd = useCallback(async () => {
    const created = new Date().toISOString();
    setNewSet({created});
    setShowNew(true);
    if ((await AsyncStorage.getItem('predictiveSets')) === 'false') return;
    const todaysPlan = await getTodaysPlan();
    if (todaysPlan.length === 0) return;
    console.log(`${HomePage.name}.onAdd: todaysPlan =`, todaysPlan);
    const todaysSets = await getTodaysSets();
    const todaysWorkouts = todaysPlan[0].workouts.split(',');
    if (todaysSets.length === 0)
      return setNewSet({created, name: todaysWorkouts[0]});
    console.log(`${HomePage.name}.onAdd: todaysSets =`, todaysSets);
    const count = todaysSets.filter(
      set => set.name === todaysSets[0].name,
    ).length;
    console.log(`${HomePage.name}.onAdd: count =`, count);
    if (count < 3) return setNewSet({...todaysSets[0], id: undefined, created});
    const nextWorkout =
      todaysWorkouts[todaysWorkouts.indexOf(todaysSets[0].name!) + 1];
    if (!nextWorkout)
      return setNewSet({...todaysSets[0], id: undefined, created});
    console.log(`${HomePage.name}.onAdd: nextWorkout =`, nextWorkout);
    setNewSet({created, name: nextWorkout});
  }, [getTodaysPlan, getTodaysSets, setNewSet, setShowNew]);

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
        keyExtractor={set => set.id!.toString()}
        onEndReached={next}
        refreshing={refreshing}
        onRefresh={refreshLoader}
      />

      <EditSet
        set={edit}
        setSet={setEdit}
        title={`Edit ${edit?.name}`}
        saveText="Edit"
        onSave={update}
        show={showEdit}
        setShow={setShowEdit}
      />

      <EditSet
        set={newSet}
        setSet={setNewSet}
        title="Add set"
        saveText="Add"
        onSave={add}
        show={showNew}
        setShow={setShowNew}
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
