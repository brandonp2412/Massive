import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import React, {useCallback, useEffect, useState} from 'react';
import {FlatList} from 'react-native';
import {List} from 'react-native-paper';
import DrawerMenu from './DrawerMenu';
import Page from './Page';
import {Plan} from './plan';
import {getPlans} from './plan.service';
import PlanItem from './PlanItem';
import {PlanPageParams} from './PlanPage';

export default function PlanList() {
  const [search, setSearch] = useState('');
  const [plans, setPlans] = useState<Plan[]>([]);
  const navigation = useNavigation<NavigationProp<PlanPageParams>>();

  const refresh = useCallback(async () => {
    getPlans(search).then(setPlans);
  }, [search]);

  useFocusEffect(
    useCallback(() => {
      refresh();
      navigation.getParent()?.setOptions({
        headerRight: () => <DrawerMenu name="Plans" />,
      });
    }, [refresh, navigation]),
  );

  useEffect(() => {
    refresh();
  }, [search, refresh]);

  const renderItem = useCallback(
    ({item}: {item: Plan}) => (
      <PlanItem item={item} key={item.id} onRemove={refresh} />
    ),
    [refresh],
  );

  const onAdd = () =>
    navigation.navigate('EditPlan', {plan: {days: '', workouts: '', id: 0}});

  return (
    <Page onAdd={onAdd} search={search} setSearch={setSearch}>
      <FlatList
        style={{height: '99%'}}
        data={plans}
        renderItem={renderItem}
        keyExtractor={set => set.id?.toString() || ''}
        ListEmptyComponent={
          <List.Item
            title="No plans yet"
            description="A plan is a list of workouts for certain days."
          />
        }
      />
    </Page>
  );
}
