import React, {useCallback, useContext, useEffect, useState} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {List, Searchbar} from 'react-native-paper';
import {DatabaseContext} from './App';
import Best from './best';
import ViewBest from './ViewBest';

export default function BestPage() {
  const [bests, setBests] = useState<Best[]>([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefresing] = useState(false);
  const [best, setBest] = useState<Best>();
  const db = useContext(DatabaseContext);

  const refresh = useCallback(async () => {
    const bestWeight = `
      SELECT name, reps, unit, MAX(weight) AS weight 
      FROM sets
      WHERE name LIKE ?
      GROUP BY name;
    `;

    const bestReps = `
      SELECT name, MAX(reps) as reps, unit, weight 
      FROM sets
      WHERE name = ?
        AND weight = ?
      GROUP BY name;
    `;

    const [weight] = await db.executeSql(bestWeight, [`%${search}%`]);
    if (!weight) return setBests([]);
    let newBest: Best[] = [];
    for (let i = 0; i < weight.rows.length; i++) {
      const [reps] = await db.executeSql(bestReps, [
        weight.rows.item(i).name,
        weight.rows.item(i).weight,
      ]);
      newBest = newBest.concat(reps.rows.raw());
    }
    setBests(newBest);
  }, [search]);

  useEffect(() => {
    refresh();
  }, [search]);

  const renderItem = ({item}: {item: Best}) => (
    <List.Item
      key={item.name}
      title={item.name}
      description={`${item.reps} x ${item.weight}${item.unit}`}
      onPress={() => setBest(item)}
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
        data={bests}
      />

      <ViewBest setBest={setBest} best={best} />
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
