import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import React, {useCallback, useEffect, useState} from 'react';
import {FlatList} from 'react-native';
import {List} from 'react-native-paper';
import {getBestSet} from './best.service';
import Page from './Page';
import {Plan} from './plan';
import {getPlans} from './plan.service';
import {SessionPageParams} from './session-page-params';

export default function SessionList() {
  const [search, setSearch] = useState('');
  const [plans, setPlans] = useState<Plan[]>([]);
  const navigation = useNavigation<NavigationProp<SessionPageParams>>();

  const refresh = useCallback(async () => {
    getPlans(search).then(setPlans);
  }, [search]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  useEffect(() => {
    refresh();
  }, [search, refresh]);

  const press = useCallback(
    async (item: Plan) => {
      const workouts = item.workouts.split(',');
      const first = workouts[0];
      const set = await getBestSet(first);
      navigation.navigate('StartSession', {plan: item, set});
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({item}: {item: Plan}) => (
      <List.Item
        title={item.days.replace(/,/g, ', ')}
        description={item.workouts.replace(/,/g, ', ')}
        onPress={() => press(item)}
      />
    ),
    [press],
  );

  return (
    <Page search={search} setSearch={setSearch}>
      <FlatList
        style={{height: '99%'}}
        data={plans}
        renderItem={renderItem}
        keyExtractor={set => set.id?.toString() || ''}
        ListEmptyComponent={
          <List.Item
            title="No plans yet"
            description="After making a plan, you can use it here."
          />
        }
      />
    </Page>
  );
}
