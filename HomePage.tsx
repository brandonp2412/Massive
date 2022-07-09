import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {FlatList, NativeModules, StyleSheet, View} from 'react-native';
import {List, Searchbar} from 'react-native-paper';
import {DatabaseContext} from './App';
import EditSet from './EditSet';
import MassiveFab from './MassiveFab';
import Set from './set';
import SetItem from './SetItem';

const limit = 10;

export default function HomePage() {
  const [sets, setSets] = useState<Set[]>();
  const [offset, setOffset] = useState(0);
  const [edit, setEdit] = useState<Set>();
  const [search, setSearch] = useState('');
  const [refreshing, setRefresing] = useState(false);
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
    setSets(result.rows.raw());
    setOffset(0);
    setEnd(false);
  }, [search]);

  const refreshLoader = async () => {
    setRefresing(true);
    refresh().finally(() => setRefresing(false));
  };

  useEffect(() => {
    refresh();
  }, [search]);

  const renderItem = ({item}: {item: Set}) => (
    <SetItem item={item} key={item.id} setSet={setEdit} onRemove={refresh} />
  );

  const save = async () => {
    refresh();
    const enabled = await AsyncStorage.getItem('alarmEnabled');
    if (enabled !== 'true') return;
    const minutes = await AsyncStorage.getItem('minutes');
    const seconds = await AsyncStorage.getItem('seconds');
    const milliseconds = Number(minutes) * 60 * 1000 + Number(seconds) * 1000;
    NativeModules.AlarmModule.timer(milliseconds);
  };

  const next = useCallback(async () => {
    if (end) return;
    setRefresing(true);
    const newOffset = offset + limit;
    const [result] = await db
      .executeSql(selectSets, [`%${search}%`, limit, newOffset])
      .finally(() => setRefresing(false));
    if (result.rows.length === 0) return setEnd(true);
    if (!sets) return;
    setSets([...sets, ...result.rows.raw()]);
    if (result.rows.length < limit) return setEnd(true);
    setOffset(newOffset);
  }, [search, end]);

  return (
    <View style={styles.container}>
      <Searchbar placeholder="Search" value={search} onChangeText={setSearch} />
      <FlatList
        data={sets}
        style={{height: '100%'}}
        ListEmptyComponent={
          <List.Item
            title="No sets yet"
            description="A set is a group of repetitions (or reps). For example, you might do a set of 8 reps on the Bench Press."
          />
        }
        renderItem={renderItem}
        keyExtractor={set => set.id!.toString()}
        onEndReached={next}
        refreshing={refreshing}
        onRefresh={refreshLoader}
      />
      <EditSet set={edit} setSet={setEdit} onSave={save} />

      <MassiveFab onPress={() => setEdit({} as Set)} />
    </View>
  );
}

const styles = StyleSheet.create({
  name: {
    fontSize: 18,
  },
  container: {
    flexGrow: 1,
    padding: 10,
    paddingBottom: '10%',
  },
});
