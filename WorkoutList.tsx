import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import React, {useCallback, useEffect, useState} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {List, Searchbar} from 'react-native-paper';
import MassiveFab from './MassiveFab';
import {getWorkouts} from './set.service';
import SetList from './SetList';
import Workout from './workout';
import WorkoutItem from './WorkoutItem';
import {WorkoutsPageParams} from './WorkoutsPage';

const limit = 15;

export default function WorkoutList() {
  const [workouts, setWorkouts] = useState<Workout[]>();
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState('');
  const [end, setEnd] = useState(false);
  const navigation = useNavigation<NavigationProp<WorkoutsPageParams>>();

  const refresh = useCallback(async () => {
    const newWorkouts = await getWorkouts({
      search: `%${search}%`,
      limit,
      offset: 0,
    });
    setWorkouts(newWorkouts);
    setOffset(0);
    setEnd(false);
  }, [search]);

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
    const newOffset = offset + limit;
    console.log(`${SetList.name}.next:`, {
      offset,
      limit,
      newOffset,
      search,
    });
    const newWorkouts = await getWorkouts({
      search: `%${search}%`,
      limit,
      offset: newOffset,
    });
    if (newWorkouts.length === 0) return setEnd(true);
    if (!workouts) return;
    setWorkouts([...workouts, ...newWorkouts]);
    if (newWorkouts.length < limit) return setEnd(true);
    setOffset(newOffset);
  }, [search, end, offset, workouts]);

  const onAdd = useCallback(async () => {
    navigation.navigate('EditWorkout', {
      value: {name: '', sets: 3, image: ''},
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
