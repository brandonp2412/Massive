import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import React, {useCallback, useEffect, useState} from 'react';
import {FlatList} from 'react-native';
import {List} from 'react-native-paper';
import {getBestReps, getBestWeights, getMaxWeights} from './best.service';
import {BestPageParams} from './BestPage';
import Chart from './Chart';
import Page from './Page';
import Set from './set';

export default function BestList() {
  const [bests, setBests] = useState<Set[]>();
  const [maxWeights, setMaxWeights] = useState<Set[]>();
  const [search, setSearch] = useState('');
  const navigation = useNavigation<NavigationProp<BestPageParams>>();

  const refresh = useCallback(async () => {
    getMaxWeights().then(setMaxWeights);
    const bestWeights = await getBestWeights(search);
    console.log(`${BestList.name}.refresh:`, {length: bestWeights.length});
    let newBest: Set[] = [];
    for (const set of bestWeights) {
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

  const left = useCallback(
    (name: string) => {
      const xData = maxWeights?.filter(set => set.name === name) || [];
      console.log(`${BestList.name}:`, {xData});
      const yData = xData.map(set => set.weight);
      console.log(`${BestList.name}:`, {yData});
      return <Chart xData={xData} yData={yData} height={50} />;
    },
    [maxWeights],
  );

  const renderItem = ({item}: {item: Set}) => (
    <List.Item
      key={item.name}
      title={item.name}
      description={`${item.reps} x ${item.weight}${item.unit || 'kg'}`}
      onPress={() => navigation.navigate('ViewBest', {best: item})}
      right={() => left(item.name)}
    />
  );

  return (
    <Page search={search} setSearch={setSearch}>
      {bests?.length === 0 ? (
        <List.Item
          title="No exercises yet"
          description="Once sets have been added, this will highlight your personal bests."
        />
      ) : (
        <FlatList
          style={{height: '99%'}}
          renderItem={renderItem}
          data={bests}
        />
      )}
    </Page>
  );
}
