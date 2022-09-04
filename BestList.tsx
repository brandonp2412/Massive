import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import React, {useCallback, useEffect, useState} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {List, Searchbar} from 'react-native-paper';
import {BestPageParams} from './BestPage';
import {getBestReps, getBestWeights} from './db';
import Set from './set';

export default function BestList() {
  const [bests, setBests] = useState<Set[]>([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefresing] = useState(false);
  const navigation = useNavigation<NavigationProp<BestPageParams>>();

  const refresh = useCallback(async () => {
    const weights = await getBestWeights(search);
    let newBest: Set[] = [];
    for (const set of weights)
      newBest.push(...(await getBestReps(search, set.weight)));
    setBests(newBest);
  }, [search]);

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

  const renderItem = ({item}: {item: Set}) => (
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
