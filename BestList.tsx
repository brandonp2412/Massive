import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import React, {useCallback, useEffect, useState} from 'react';
import {FlatList} from 'react-native';
import {List} from 'react-native-paper';
import {getBestReps, getBestWeights} from './best.service';
import {BestPageParams} from './BestPage';
import Page from './Page';
import Set from './set';

export default function BestList() {
  const [bests, setBests] = useState<Set[]>([]);
  const [search, setSearch] = useState('');
  const navigation = useNavigation<NavigationProp<BestPageParams>>();

  const refresh = useCallback(async () => {
    const weights = await getBestWeights(search);
    console.log(`${BestList.name}.refresh:`, {length: weights.length});
    let newBest: Set[] = [];
    for (const set of weights) {
      const reps = await getBestReps(set.name, set.weight);
      newBest.push(...reps);
    }
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
    <Page search={search} setSearch={setSearch}>
      <FlatList
        ListEmptyComponent={
          <List.Item
            title="No exercises yet"
            description="Once sets have been added, this will highlight your personal bests."
          />
        }
        renderItem={renderItem}
        data={bests}
      />
    </Page>
  );
}
