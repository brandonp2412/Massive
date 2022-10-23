import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import React, {useCallback, useEffect, useState} from 'react';
import {FlatList} from 'react-native';
import {List} from 'react-native-paper';
import DrawerHeader from './DrawerHeader';
import Page from './Page';
import {Plan} from './plan';
import {PlanPageParams} from './plan-page-params';
import {getPlans} from './plan.service';
import PlanItem from './PlanItem';

export default function PlanList() {
  const [search, setSearch] = useState('');
  const [plans, setPlans] = useState<Plan[]>();
  const navigation = useNavigation<NavigationProp<PlanPageParams>>();

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

  const renderItem = useCallback(
    ({item}: {item: Plan}) => (
      <PlanItem item={item} key={item.id} onRemove={refresh} />
    ),
    [refresh],
  );

  const onAdd = () =>
    navigation.navigate('EditPlan', {plan: {days: '', workouts: ''}});

  return (
    <>
      <DrawerHeader name="Plans" />
      <Page onAdd={onAdd} search={search} setSearch={setSearch}>
        {plans?.length === 0 ? (
          <List.Item
            title="No plans yet"
            description="A plan is a list of workouts for certain days."
          />
        ) : (
          <FlatList
            style={{flex: 1}}
            data={plans}
            renderItem={renderItem}
            keyExtractor={set => set.id?.toString() || ''}
          />
        )}
      </Page>
    </>
  );
}
