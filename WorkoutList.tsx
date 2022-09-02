import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {List, Searchbar} from 'react-native-paper';
import MassiveFab from './MassiveFab';
import {DatabaseContext} from './Routes';
import SetList from './SetList';
import Workout from './workout';
import WorkoutItem from './WorkoutItem';
import {WorkoutsPageParams} from './WorkoutsPage';

const limit = 15;

export default function WorkoutList() {
  const [workouts, setWorkouts] = useState<Workout[]>();
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [end, setEnd] = useState(false);
  const db = useContext(DatabaseContext);
  const navigation = useNavigation<NavigationProp<WorkoutsPageParams>>();

  const select = `
    SELECT DISTINCT sets.name
    FROM sets
    WHERE sets.name LIKE ? 
    ORDER BY sets.name
    LIMIT ? OFFSET ?
  `;

  const refresh = useCallback(async () => {
    const [result] = await db.executeSql(select, [`%${search}%`, limit, 0]);
    if (!result) return setWorkouts([]);
    console.log(`${WorkoutList.name}.refresh:`, {search, limit});
    setWorkouts(result.rows.raw());
    setOffset(0);
    setEnd(false);
  }, [search, db, select]);

  const refreshLoader = useCallback(async () => {
    setRefreshing(true);
    refresh().finally(() => setRefreshing(false));
  }, [setRefreshing, refresh]);

  useEffect(() => {
    refresh();
  }, [search, refresh]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const renderItem = useCallback(
    ({item}: {item: Workout}) => (
      <WorkoutItem item={item} key={item.name} onRemoved={refresh} />
    ),
    [refresh],
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
      .executeSql(select, [`%${search}%`, limit, newOffset])
      .finally(() => setRefreshing(false));
    if (result.rows.length === 0) return setEnd(true);
    if (!workouts) return;
    setWorkouts([...workouts, ...result.rows.raw()]);
    if (result.rows.length < limit) return setEnd(true);
    setOffset(newOffset);
  }, [search, end, offset, workouts, db, select]);

  const onAdd = useCallback(async () => {
    navigation.navigate('EditWorkout', {
      value: {name: '', sets: 3},
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Searchbar placeholder="Search" value={search} onChangeText={setSearch} />
      <FlatList
        data={workouts}
        style={{height: '95%', paddingBottom: 10}}
        ListEmptyComponent={
          <List.Item
            title="No workouts yet."
            description="A workout is something you do at the gym. For example Deadlifts are a workout."
          />
        }
        renderItem={renderItem}
        keyExtractor={w => w.name}
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
