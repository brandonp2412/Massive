import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {FlatList, NativeModules, StyleSheet, View} from 'react-native';
import {List, Searchbar} from 'react-native-paper';
import {DatabaseContext} from './App';
import EditSet from './EditSet';
import MassiveFab from './MassiveFab';
import Set from './set';
import SetItem from './SetItem';

const limit = 15;

export default function HomePage() {
  const [sets, setSets] = useState<Set[]>();
  const [offset, setOffset] = useState(0);
  const [edit, setEdit] = useState<Set>();
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
    setEdit(undefined);
    await refresh();
  }, [edit, setEdit, refresh, db]);

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
    setNewSet(undefined);
    await refresh();
    const enabled = await AsyncStorage.getItem('alarmEnabled');
    if (enabled !== 'true') return;
    const minutes = await AsyncStorage.getItem('minutes');
    const seconds = await AsyncStorage.getItem('seconds');
    const milliseconds = Number(minutes) * 60 * 1000 + Number(seconds) * 1000;
    NativeModules.AlarmModule.timer(milliseconds);
  }, [newSet, setNewSet, refresh, db]);

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
      />

      <EditSet
        set={newSet}
        setSet={setNewSet}
        title="Add set"
        saveText="Add"
        onSave={add}
      />
      <MassiveFab
        onPress={() => setNewSet({created: new Date().toISOString()} as Set)}
      />
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
