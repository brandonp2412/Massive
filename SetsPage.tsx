import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {List, Searchbar} from 'react-native-paper';
import {DatabaseContext} from './App';
import {StackParams} from './HomePage';
import MassiveFab from './MassiveFab';
import Set from './set';
import SetItem from './SetItem';

const limit = 15;

export default function SetsPage() {
  const [sets, setSets] = useState<Set[]>();
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [end, setEnd] = useState(false);
  const db = useContext(DatabaseContext);
  const navigation = useNavigation<NavigationProp<StackParams>>();

  const selectSets = `
    SELECT * from sets 
    WHERE name LIKE ? 
    ORDER BY created DESC 
    LIMIT ? OFFSET ?
  `;

  const refresh = useCallback(async () => {
    const [result] = await db.executeSql(selectSets, [`%${search}%`, limit, 0]);
    if (!result) return setSets([]);
    console.log(`${SetsPage.name}.refresh:`, {search, limit});
    setSets(result.rows.raw());
    setOffset(0);
    setEnd(false);
  }, [search, db, selectSets]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const refreshLoader = useCallback(async () => {
    setRefreshing(true);
    refresh().finally(() => setRefreshing(false));
  }, [setRefreshing, refresh]);

  useEffect(() => {
    if (!search) return;
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
    setRefreshing(true);
    const newOffset = offset + limit;
    console.log(`${SetsPage.name}.next:`, {
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
    const set: Set = {
      created: new Date().toISOString(),
      name: '',
      id: 0,
      reps: 0,
      weight: 0,
      unit: 'kg',
    };
    navigation.navigate('EditSet', {set});
  }, [navigation]);

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
