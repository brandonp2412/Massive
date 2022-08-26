import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {List, Searchbar} from 'react-native-paper';
import {DatabaseContext} from './App';
import Best from './best';
import {BestPageParams} from './BestPage';
import DrawerMenu from './DrawerMenu';

export default function BestList() {
  const [bests, setBests] = useState<Best[]>([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefresing] = useState(false);
  const db = useContext(DatabaseContext);
  const navigation = useNavigation<NavigationProp<BestPageParams>>();

  const refresh = useCallback(async () => {
    const bestWeight = `
      SELECT name, reps, unit, MAX(weight) AS weight 
      FROM sets
      WHERE name LIKE ? AND NOT hidden
      GROUP BY name;
    `;
    const bestReps = `
      SELECT name, MAX(reps) as reps, unit, weight 
      FROM sets
      WHERE name = ? AND weight = ? AND NOT hidden
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
  }, [search, db]);

  useFocusEffect(
    useCallback(() => {
      refresh();
      navigation.getParent()?.setOptions({
        headerRight: () => null,
      });
    }, [refresh, navigation]),
  );

  useEffect(() => {
    refresh();
  }, [search, refresh]);

  const renderItem = ({item}: {item: Best}) => (
    <List.Item
      key={item.name}
      title={item.name}
      description={`${item.reps} x ${item.weight}${item.unit}`}
      onPress={() => navigation.navigate('ViewBest', {best: item})}
    />
  );

  return (
    <View style={styles.container}>
      <Searchbar placeholder="Search" value={search} onChangeText={setSearch} />
      <FlatList
        ListEmptyComponent={
          <List.Item
            title="No exercises yet"
            description="Once sets have been added, this will highlight your personal bests."
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
