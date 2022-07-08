import React, {useContext, useEffect, useState} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {List, Searchbar} from 'react-native-paper';
import {DatabaseContext} from './App';
import Exercise from './exercise';

export default function BestPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefresing] = useState(false);
  const db = useContext(DatabaseContext);

  const refresh = async () => {
    const [result] = await db.executeSql(
      `SELECT name, MAX(reps) as reps, unit, MAX(weight) AS weight 
      FROM sets
      WHERE name LIKE ?
      GROUP BY name;`,
      [`%${search}%`],
    );
    if (!result) return setExercises([]);
    setExercises(result.rows.raw());
  };

  useEffect(() => {
    refresh();
  }, [search]);

  const renderItem = ({item}: {item: Exercise}) => (
    <List.Item
      key={item.name}
      title={item.name}
      description={`Best: ${item.reps} x ${item.weight}${item.unit}`}
    />
  );

  return (
    <View style={styles.container}>
      <Searchbar placeholder="Search" value={search} onChangeText={setSearch} />
      <FlatList
        ListEmptyComponent={
          <List.Item
            title="No exercises yet"
            description="Once sets have been added, Exercises list your personal bests."
          />
        }
        refreshing={refreshing}
        onRefresh={async () => {
          setRefresing(true);
          await refresh();
          setRefresing(false);
        }}
        renderItem={renderItem}
        data={exercises}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    flexGrow: 1,
    paddingBottom: '10%',
  },
});
